from PaddockTS.Data.environmental import download_environmental_data
from daesim2_analysis.experiment import Experiment
from utils.get_df_forcing import get_df_forcing
from utils.input import Input
from PaddockTS.query import Query

from pandas import Timestamp

parse_date = lambda x: Timestamp(year=x.year, month=x.month, day=x.day)

def run_daesim(i: Input, static_dir: str):
    df_forcing = get_df_forcing(i, static_dir)
    print('hereeeeeeeeeeeeeeeeeeeeeee')
    e = Experiment(
        xsite=i.xsite,
        CLatDeg=i.lat,
        CLonDeg=i.lon,
        crop_type=i.crop_type,
        sowing_dates=[i.sowing_date],
        harvest_dates=[i.harvest_date],
        df_forcing=df_forcing,
        daesim_config='daesim_configs/DAESIM1.json'
        # df_forcing_type='0'
    )

