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
import fcntl
import os

# Half-side of the square bbox around the site, km. The forcing is built for
# the bbox centre, so this only affects the cache key.
BUFFER_KM = 1.0


def make_troi(i: Input) -> Troi:
    """The troi (site + season identity) for a request. Its stub keys every cache."""
    return Troi.from_lat_lon(
        lat=i.lat, lon=i.lon, buffer_km=BUFFER_KM,
        start=i.sowing_date, end=i.harvest_date,
    )


def get_df_forcing(i: Input, troi: Troi | None = None) -> list[str]:
    troi = troi or make_troi(i)
    # daesim2_analysis.utils.load_df_forcing expects a 'Date' column, while
    # paddocktimeseries writes 'date'; keep a renamed copy next to its cache.
    path = f"{troi.out_dir}/{troi.stub}_df_forcing.csv"
    if exists(path):
        return [path]
    # Serialise builds per stub: two jobs for the same site/season (e.g. two
    # crops) would otherwise race on paddocktimeseries' own CSV cache.
    with open(f"{troi.out_dir}/.forcing.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            if not exists(path):
                df = daesim_forcing(troi)
                tmp = path + ".part"
                df.rename(columns={"date": "Date"}).to_csv(tmp, index=False)
                os.replace(tmp, path)
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)
    return [path]
