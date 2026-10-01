from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from utils.result_response import ResultResponse
from utils.run_response import RunResponse
from utils.get_df_forcing import make_troi
from utils.run_daesim import run_daesim
from utils.input import Input
from utils.jobs import DONE, Jobs, job_key, read_json, write_json_atomic
from pathlib import Path
import matplotlib
import os

os.environ["MPLBACKEND"] = "Agg"
matplotlib.use("Agg", force=True)

app = FastAPI(title="DAESIM Backend", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:2000,http://127.0.0.1:2000").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root of the shared data volume; results live in STATIC_DIR/DAESIMWeb/{job_key}/.
STATIC_DIR = Path(os.environ.get("DAESIM_STATIC_DIR", "/borevitz_projects/data/"))
RESULTS_DIR = STATIC_DIR / "DAESIMWeb"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
JOBS = Jobs(RESULTS_DIR, max_workers=int(os.environ.get("DAESIM_MAX_WORKERS", "2")))

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.post("/run", response_model=RunResponse)
def run_job(i: Input):
    """Start (or reuse) the run for this site, season, crop and model config.

    The job id is derived from those inputs, not from ``xsite``: identical
    requests share one result, and a request already in flight is not started
    again. ``xsite`` is kept as a label in meta.json.
    """
    troi = make_troi(i)
    key = job_key(troi.stub, i.crop_type)
    JOBS.dir(key).mkdir(parents=True, exist_ok=True)
    write_json_atomic(JOBS.meta_path(key), {
        "XSite": i.xsite,
        "Lat": i.lat,
        "Lon": i.lon,
        "sowingDate": i.sowing_date.strftime("%Y/%m/%d"),
        "harvestDate": i.harvest_date.strftime("%Y/%m/%d"),
        "cropType": i.crop_type,
        "troiStub": troi.stub,
        "jobId": key,
    })
    status = JOBS.submit(key, run_daesim, i, JOBS.dir(key), troi)
    return RunResponse(job_id=key, status=status)


@app.get("/results/{job_id}", response_model=ResultResponse)
def get_results(job_id: str):
    st = JOBS.status(job_id)
    if st is None:
        # Results written before jobs had keyed directories: {xsite}_plot.json.
        legacy_plot = RESULTS_DIR / f"{job_id}_plot.json"
        if legacy_plot.exists():
            return ResultResponse(status=DONE, plots=read_json(legacy_plot, {}),
                                  meta=read_json(RESULTS_DIR / f"{job_id}_meta.json", {}))
        raise HTTPException(status_code=404, detail=f"Unknown job {job_id}")
    meta = read_json(JOBS.meta_path(job_id), {})
    if st["status"] == DONE:
        return ResultResponse(status=DONE, plots=read_json(JOBS.plot_path(job_id), {}), meta=meta)
    return ResultResponse(status=st["status"], plots={}, meta=meta, error=st.get("error"))
