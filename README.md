Web interface for [DAESIM](https://github.com/NortonAlex/DAESIM), driven through
[daesim2-analysis](https://github.com/NortonAlex/daesim2-analysis), with climate
forcing assembled by [paddocktimeseries](https://github.com/johnburley3000/paddocktimeseries)
(the `PaddockTS` package, 1.x).

## How the backend is wired

Nothing is installed in the backend image. It runs on the host's conda env
`paddockts-env` (Python 3.11, the paddocktimeseries native stack, plus the
extras in `backend/requirements-paddockts-env.txt`) and on volume-mounted checkouts:

| Checkout | Branch | Used for |
|---|---|---|
| `/borevitz_projects/repos/paddocktimeseries` | main | `PaddockTS.daesim_forcing` + `troi` (SILO/OzWALD forcing) |
| `/borevitz_projects/repos/DAESIM` | `yasar` (fork of NortonAlex/DAESIM) | the model |
| `/borevitz_projects/repos/daesim2-analysis` | main (local `yasar` = main) | `Experiment`, `update_and_run_model` |

## Jobs, caching and concurrency

A job is identified by what determines its output, not by the site label:
the troi stub (bbox snapped to ~100 m + dates), the crop type, and the
contents of `backend/daesim_configs/DAESIM1.json` and
`backend/parameters/PARAMS1.json`. `POST /run` returns that key as `job_id`
(`xsite` is kept as a label in `meta.json`), so

- identical requests share one result and are never computed twice;
- a request whose run is still in flight is not started again
  (in-process set + a per-job `flock`, so this also holds across workers or
  a restart);
- `GET /results/{job_id}` returns `status: running | done | error` (with the
  error text), instead of 404 while a run is in progress;
- model runs go through a small worker pool (`DAESIM_MAX_WORKERS`, default 2);
- status, forcing CSV and `plot.json` are written atomically (temp + rename).

Results live in `/borevitz_projects/data/DAESIMWeb/{job_id}/`
(`plot.json`, `meta.json`, `status.json`, `df_forcing.png`, `output.png`).
Forcing data is cached by troi: raw SILO/OzWALD observations under
`/borevitz_projects/data/PaddockTSWeb/{silo,ozwald}_store` (shared with
PaddockTSWeb), the per-site table under `/borevitz_projects/data/DAESIMWeb/troi/`.

## Run locally

```
backend/run.sh            # uvicorn on :2000, env vars as in compose.yml
```
Override `PORT`, `DAESIM_STATIC_DIR`, `DAESIM_MAX_WORKERS`, `TROI_OUTDIR`, `TROI_TMPDIR` as needed.
`run.sh` uses `--reload` for development; the container does not, since a reload
kills in-flight runs.

## Frontend: map and Google Maps key

The home page is a Google map (hybrid imagery) with a draggable site marker,
like paddocktimeseries.net; the query bar above it takes coordinates as
`lat, lon` and stays in place across the map and results views. The map needs
a browser key in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`:

- `.env` at the repo root (gitignored): docker compose reads it and passes the
  key as a build arg to the frontend image;
- `frontend/.env.local` (gitignored): read by `npm run dev`.

See `.env.example`. Without a key the home page shows a notice instead of the map.

## Deployment

Start the caddy container in
[borevitz_projects_caddy](https://github.com/thestochasticman/borevitz_projects_caddy)
first and make sure the `edge` network exists:

```
sudo docker network ls --filter name=^edge$ --format '{{.Name}}'   # expect: edge
sudo docker network create edge                                     # if missing
```

Build and start (the frontend build bakes in the Maps key from `.env`):

```
sudo docker compose build backend frontend
sudo docker compose up -d backend frontend
```

Package changes in the mounted checkouts only need
`sudo docker compose restart backend`. The site is served at
http://130.56.246.157/DAESIM (backend proxied at `/DAESIM/api`).

## Shutting down

```
sudo docker compose down backend frontend
```
