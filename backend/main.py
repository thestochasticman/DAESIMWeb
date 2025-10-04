from daesim2_analysis.experiment import Experiment
from fastapi.middleware.cors import CORSMiddleware
from utils.result_response import ResultResponse
from utils.run_response import RunResponse
from fastapi.staticfiles import StaticFiles
from utils.run_daesim import run_daesim

from utils.input import Input
from fastapi import FastAPI
from pathlib import Path
from uuid import uuid4
import matplotlib
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

# STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR = Path('/borevitz_projects/data/PaddockTSWeb')
STATIC_DIR.mkdir(parents=True, exist_ok=True)
PATH_STUB_MAPPING = STATIC_DIR / '.json'

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
@app.post("/run", response_model=RunResponse)
def run_job(i: Input):
    run_daesim(i=i, static_dir=STATIC_DIR)
    print('I am here')
    # Compute or respect stub
    # if q.stub == q.get_stub():
    #     job_id = get_stub_job_id(q.stub, PATH_STUB_MAPPING)
    # else:
    #     job_id = q.stub
    # q2 = Query(
    #     q.lat,
    #     q.lon,
    #     q.buffer,
    #     q.start_time,
    #     q.end_time,
    #     q.collections,
    #     q.bands,
    #     q.filter,
    #     stub=job_id,
    #     tmp_dir=str(STATIC_DIR),
    #     out_dir=str(STATIC_DIR)
    # )

    # # get_outputs(q2)
    # get_paddocks(q2)
    # get_paddock_ts(q2)
    # add_indices_and_veg_frac(q2)
    # plot(q2)
    return RunResponse(job_id='1')

# @app.get("/results/{job_id}", response_model=ResultResponse)
# def get_results(job_id: str):
# 
    # job_dir = STATIC_DIR / job_id
    # if not job_dir.exists():
    #     raise HTTPException(status_code=404, detail="job_id not found")
    
    # plots = [f"/static/{job_id}/{p.name}" for p in sorted(job_dir.glob("*.png"))]


    # plots = [
    #     f"static/{job_id}/checkpoints/{job_id}_paddock_map_auto_fourier.png",
    #     f"static/{job_id}/checkpoints/{job_id}_paddock_map_auto_rgb.png",
    # ]
    # videos = [
    #     # "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
    #     f"static/{job_id}/checkpoints/{job_id}_manpad_RGB.mp4",
    #     f"static/{job_id}/checkpoints/{job_id}_manpad_vegfrac.mp4",
    # ]

    # meta_path = job_dir / "meta.json"
    # meta = {}
    # if meta_path.exists():
    #     meta = json.loads(meta_path.read_text(encoding="utf-8"))

    # return ResultResponse(status="done", plots=plots, videos=videos, meta=meta)
