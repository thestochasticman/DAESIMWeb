from PaddockTS.Data.environmental import download_environmental_data
from daesim2_analysis.utils import load_df_forcing
from DAESIM_preprocess.daesim_forcing import daesim_forcing
from PaddockTS.query import Query
from utils.input import Input
from pandas import DataFrame
from os.path import exists
from pandas import read_csv

def get_df_forcing(i: Input, static_dir: str)->DataFrame:
    q = Query(
        lat=i.lat,
        lon=i.lon,
        start_time=i.sowing_date,
        end_time=i.harvest_date,
        buffer=0.01,
        tmp_dir=static_dir,
        out_dir=static_dir
    )
    path_df_forcing = f'{q.stub_tmp_dir}/environmental/{q.stub}_DAESim_forcing.csv'

    if not exists(path_df_forcing):
        try:
            download_environmental_data(q)
        except:
       
            print('error while downloading')

    df = read_csv(path_df_forcing)
    df = df.rename(columns={'date': 'Date'})
    df.to_csv(path_df_forcing)
    return [path_df_forcing]
