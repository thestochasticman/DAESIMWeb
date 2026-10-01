Web interface for [DAESIM](https://github.com/NortonAlex/DAESIM), driven through
[daesim2-analysis](https://github.com/NortonAlex/daesim2-analysis), with climate
forcing assembled by [paddocktimeseries](https://github.com/johnburley3000/paddocktimeseries)
(the `PaddockTS` package, 1.x).

## How the backend is wired

Nothing is installed in the backend image. It runs on the host's conda env
`paddockts-env` (Python 3.11, the paddocktimeseries native stack, plus
`SALib`, which daesim2-analysis needs) and on volume-mounted checkouts:

| Checkout | Branch | Used for |
|---|---|---|
| `/borevitz_projects/repos/paddocktimeseries` | main | `PaddockTS.daesim_forcing` + `troi` (SILO/OzWALD forcing) |
| `/borevitz_projects/repos/DAESIM` | `yasar` (fork of NortonAlex/DAESIM) | the model |
| `/borevitz_projects/repos/daesim2-analysis` | main | `Experiment`, `update_and_run_model` |

Forcing data is cached by troi: raw SILO/OzWALD observations under
`/borevitz_projects/data/PaddockTSWeb/{silo,ozwald}_store` (shared with
PaddockTSWeb), the per-site table under `/borevitz_projects/data/DAESIMWeb/troi/`.
Results (`{xsite}_plot.json`, `{xsite}_meta.json`, PNGs) go to
`/borevitz_projects/data/DAESIMWeb/`.

## Run locally

```
backend/run.sh            # uvicorn on :2000, env vars as in compose.yml
```
Override `PORT`, `DAESIM_STATIC_DIR`, `TROI_OUTDIR`, `TROI_TMPDIR` as needed.

## Deployment

Start the caddy container in
[borevitz_projects_caddy](https://github.com/thestochasticman/borevitz_projects_caddy)
first and make sure the `edge` network exists:

```
sudo docker network ls --filter name=^edge$ --format '{{.Name}}'   # expect: edge
sudo docker network create edge                                     # if missing
```

Build and start:

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
