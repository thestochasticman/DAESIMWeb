"""DAESIM forcing table via paddocktimeseries (PaddockTS 1.x).

Replaces the PaddockTS 0.7 ``Query`` + ``download_environmental_data`` +
``DAESIM_preprocess.daesim_forcing`` path. SILO and OzWALD observations are
cached machine-wide by the troi data stores under ``{config.tmp_dir}``
(``silo_store/``, ``ozwald_store/``; shared with PaddockTSWeb when both point
at the same TROI_TMPDIR). The assembled per-site CSV is cached under
``{config.out_dir}/{stub}/``, where ``stub`` is troi's hash of (bbox, dates),
so a repeat query for the same site and season downloads nothing.
"""
from PaddockTS.daesim_forcing import daesim_forcing
from troi import Troi
from utils.input import Input
from os.path import exists

# Half-side of the square bbox around the site, km. The forcing is built for
# the bbox centre, so this only affects the cache key.
BUFFER_KM = 1.0


def get_df_forcing(i: Input) -> list[str]:
    troi = Troi.from_lat_lon(
        lat=i.lat, lon=i.lon, buffer_km=BUFFER_KM,
        start=i.sowing_date, end=i.harvest_date,
    )
    # daesim2_analysis.utils.load_df_forcing expects a 'Date' column, while
    # paddocktimeseries writes 'date'; keep a renamed copy next to its cache.
    path = f"{troi.out_dir}/{troi.stub}_df_forcing.csv"
    if not exists(path):
        df = daesim_forcing(troi)
        df.rename(columns={"date": "Date"}).to_csv(path, index=False)
    return [path]
