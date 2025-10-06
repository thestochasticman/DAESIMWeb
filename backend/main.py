from daesim2_analysis.experiment import Experiment
from fastapi.middleware.cors import CORSMiddleware
from utils.result_response import ResultResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from utils.run_response import RunResponse
from utils.date_encoder import DateEncoder
from utils.run_daesim import run_daesim
from fastapi import BackgroundTasks
from fastapi import HTTPException
from utils.input import Input
from fastapi import FastAPI
from os.path import exists
from pathlib import Path
from json import dump
from json import load
import matplotlib
import json
import os

os.environ["MPLBACKEND"] = "Agg"
matplotlib.use("Agg", force=True)

app = FastAPI(title="DAESIM Backend", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:2000",  "http://127.0.0.1:2000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path('/borevitz_projects/data/')
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
@app.post("/run", response_model=RunResponse)
def run_job(i: Input, background_tasks:BackgroundTasks):
    meta_path = STATIC_DIR / 'DAESIMWeb/' / f'{i.xsite}_meta.json'
    background_tasks.add_task(run_daesim, i=i, static_dir=STATIC_DIR)
    
    
    meta = {
        "XSite": str(i.xsite),
        "Lat": float(i.lat),
        "Lon": float(i.lon),
        "sowingDate": i.sowing_date if isinstance(i.sowing_date, str)
        else i.sowing_date.strftime("%Y/%m/%d"),
        "harvestDate": i.harvest_date if isinstance(i.harvest_date, str)
        else i.harvest_date.strftime("%Y/%m/%d"),
        "cropType": str(i.crop_type)
    }

    # overwrite the file each time; ensure it’s flushed completely
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2, cls=DateEncoder)
        f.flush()
        os.fsync(f.fileno())

    return RunResponse(job_id=i.xsite)

@app.get("/results/{job_id}", response_model=ResultResponse)
def get_results(job_id: str):
    # job_dir = STATIC_DIR / "DAESIMWeb" / f'{job_id}_plot.json'
    # if not job_dir.exists():
    #     raise HTTPException(status_code=404, detail="job_id not found")

    # # Explicitly pick only 2 plots
    
    # # plots = [
    # #     f"/static/DAESIMWeb/{job_id}_df_forcing.png",
    # #     f"/static/DAESIMWeb/{job_id}_output.png",
    # # ]
    # plots = load(open('/static/DAESIMWeb/{job_id}_plot.json'))

    # return ResultResponse(status="done", plots=plots, meta={})

    plot_path = STATIC_DIR / 'DAESIMWeb'/ f'{job_id}_plot.json'
    meta_path = STATIC_DIR / 'DAESIMWeb/' / f'{job_id}_meta.json'
    if not plot_path.exists():
        raise HTTPException(status_code=404, detail=f"Results for job {job_id} not found")

    if not meta_path.exists():
        raise HTTPException(status_code=404, detail=f"Results for job {job_id} not found")

    # plots = load(open(plot_path))
    # meta = load(open(meta_path))
    # print(meta)

    with open(plot_path) as pf, open(meta_path) as mf:
        plots = json.load(pf)
        meta = json.load(mf)

    # sanity check
    print("Loaded META:", meta)

    return ResultResponse(status="done", plots=plots, meta=meta)
    # return ResultResponse(status="done", plots=plots, meta=meta)
