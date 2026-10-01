#!/usr/bin/env bash
# Run the backend locally against the host paddockts-env and the sibling checkouts.
# Override any of these in the environment before calling.
set -euo pipefail
REPOS=${REPOS:-/borevitz_projects/repos}
CONDA=${CONDA:-/borevitz_projects/dev/tools/miniconda3}
export PATH="$CONDA/envs/paddockts-env/bin:$PATH"
export PYTHONPATH="${PYTHONPATH:-$REPOS/paddocktimeseries:$REPOS/DAESIM/src:$REPOS/daesim2-analysis/src}"
export PYTHONNOUSERSITE=1 PYTHONUNBUFFERED=1 MPLBACKEND=Agg
export DAESIM_STATIC_DIR="${DAESIM_STATIC_DIR:-/borevitz_projects/data}"
export TROI_OUTDIR="${TROI_OUTDIR:-$DAESIM_STATIC_DIR/DAESIMWeb/troi}"
export TROI_TMPDIR="${TROI_TMPDIR:-/borevitz_projects/data/PaddockTSWeb}"   # shares silo/ozwald stores with PaddockTSWeb
cd "$(dirname "$0")"
exec python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-2000}" --reload
