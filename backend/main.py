from daesim2_analysis.experiment import Experiment
from fastapi.middleware.cors import CORSMiddleware
from utils.result_response import ResultResponse
from fastapi import BackgroundTasks
from fastapi.staticfiles import StaticFiles
from utils.run_response import RunResponse
from utils.run_daesim import run_daesim
from fastapi import HTTPException
from utils.input import Input
from fastapi import FastAPI
from pathlib import Path
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

STATIC_DIR = Path('/borevitz_projects/data/')
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
@app.post("/run", response_model=RunResponse)
def run_job(i: Input, background_tasks:BackgroundTasks):
    background_tasks.add_task(run_daesim, i=i, static_dir=STATIC_DIR)
    # run_daesim(i=i, static_dir=STATIC_DIR)
    return RunResponse(job_id=i.xsite)

@app.get("/results/{job_id}", response_model=ResultResponse)
def get_results(job_id: str):
    job_dir = STATIC_DIR / "DAESIMWeb" / job_id 
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="job_id not found")

    # Explicitly pick only 2 plots
    
    plots = [
        f"/static/DAESIMWeb/{job_id}_df_forcing.png",
        f"/static/DAESIMWeb/{job_id}_output.png",
    ]

    return ResultResponse(status="done", plots=plots, meta={})
