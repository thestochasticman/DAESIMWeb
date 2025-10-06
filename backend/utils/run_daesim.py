from utils.build_daesim_plot_json import build_daesim_plot_json
from daesim.utils import daesim_io_write_diag_to_nc
from daesim2_analysis.experiment import Experiment
from daesim2_analysis.parameters import Parameters
from utils.get_df_forcing import get_df_forcing

from daesim2_analysis.run import *
from PaddockTS.query import Query
from matplotlib.axes import Axes
import matplotlib.pyplot as plt
from utils.input import Input
from pandas import Timestamp
from os.path import exists
from pathlib import Path
from os.path import join
from json import dump

parse_date = lambda x: Timestamp(year=x.year, month=x.month, day=x.day)

def run_daesim(i: Input, static_dir: str):
    df_forcing = get_df_forcing(i, f"{static_dir}/PaddockTSWeb")
    experiment = Experiment(
        xsite=i.xsite,
        CLatDeg=i.lat,
        CLonDeg=i.lon,
        crop_type=i.crop_type,
        sowing_dates=[i.sowing_date],
        harvest_dates=[i.harvest_date],
        df_forcing=df_forcing,
        daesim_config='daesim_configs/DAESIM1.json',
        parameters='parameters/PARAMS1.json',
        dir_results=join(static_dir, 'DAESIMWeb/')
    )

    parameters: Parameters = experiment.parameters
    filename_write = f"DAESIM2-Plant_{experiment.xsite}_{experiment.crop_type}.nc"
    model_output = update_and_run_model(
        parameters.init, 
        experiment.PlantX,
        experiment.input_data,
        parameters.df,
        parameters.problem
    )

    if not exists(f"{experiment.dir_results}{filename_write}"):

        daesim_io_write_diag_to_nc(
            experiment.PlantX,
            model_output,
            experiment.dir_results,
            filename_write,
            experiment.ForcingDataX.time_index,
            nc_attributes={'title': experiment.title, 'description': experiment.description}
        )
        print('model ran')

    d_fd_mapping = {
        'Climate_solRadswskyb_f': 'forcing 01',
        'Climate_solRadswskyd_f': 'forcing 02',
        'Climate_airTempCMin_f': 'forcing 03',
        'Climate_airTempCMax_f': 'forcing 04',
        'Climate_airPressure_f': 'forcing 05',
        'Climate_airRH_f': 'forcing 06',
        'Climate_airCO2_f': 'forcing 07',
        'Climate_airO2_f': 'forcing 08',
        'Climate_airU_f': 'forcing 09',
        'Climate_soilTheta_z_f': 'forcing 10',
        'Climate_doy_f': 'forcing 11',
        'Climate_year_f': 'forcing 12'
    }
    axes: list[Axes]
    fig, axes = plt.subplots(4,1,figsize=(8,8),sharex=True)
    axes[0].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_solRadswskyb_f']] + model_output[d_fd_mapping['Climate_solRadswskyd_f']], c='0.4', label="Global")
    axes[0].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_solRadswskyb_f']], c='goldenrod', alpha=0.5, label="Direct")
    axes[0].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_solRadswskyd_f']], c='C0', alpha=0.5, label="Diffuse")
    axes[0].set_ylabel("Solar radiation\n"+r"($\rm W \; m^{-2}$)")
    axes[0].legend(loc=1,handlelength=0.75)
    axes[0].tick_params(axis='x', labelrotation=45)
    axes[0].annotate("Solar radiation", (0.02,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[0].set_ylim([0,400])

    # axes[0].figure.savefig(f"{experiment.dir_results}/solar_radiation.png")

    axes[1].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_airTempCMin_f']], c="lightsteelblue", label="Min")
    axes[1].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_airTempCMax_f']], c="indianred", label="Max")
    leafTempC = experiment.PlantX.Site.compute_skin_temp((model_output[d_fd_mapping['Climate_airTempCMin_f']] + model_output[d_fd_mapping['Climate_airTempCMax_f']])/2, model_output[d_fd_mapping['Climate_solRadswskyb_f']] + model_output[d_fd_mapping['Climate_solRadswskyd_f']])
    axes[1].plot(model_output[d_fd_mapping['Climate_doy_f']], leafTempC, c="darkgreen", label="Leaf")
    axes[1].plot(model_output[d_fd_mapping['Climate_doy_f']], (model_output[d_fd_mapping['Climate_airTempCMin_f']] + model_output[d_fd_mapping['Climate_airTempCMax_f']])/2, c="0.5", label="Air")
    axes[1].set_ylabel("Air Temperature\n"+r"($\rm ^{\circ}C$)")
    # axes[1].tick_params(axis='x', labelrotation=45)
    axes[1].legend(loc=1,handlelength=0.75)
    axes[1].annotate("Air temperature", (0.02,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[1].set_ylim([-5,45])

    axes[2].plot(model_output[d_fd_mapping['Climate_doy_f']], model_output[d_fd_mapping['Climate_airRH_f']], c="0.4")
    axes[2].set_ylabel("Relative humidity\n"+r"(%)")
    # axes[2].tick_params(axis='x', labelrotation=45)
    axes[2].annotate("Relative humidity", (0.02,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)

    xcolors = np.linspace(0.9,0.1,experiment.PlantX.PlantCH2O.SoilLayers.nlevmlsoil).astype(str)
    for iz in range(experiment.PlantX.PlantCH2O.SoilLayers.nlevmlsoil):
        zlayer_forcing_label = d_fd_mapping['Climate_soilTheta_z_f'] + f' z{iz}'
        axes[3].plot(model_output[d_fd_mapping['Climate_doy_f']], 100*model_output[zlayer_forcing_label], c=xcolors[iz])
    axes[3].set_ylabel("Soil moisture\n"+r"(%)")
    # axes[3].tick_params(axis='x', labelrotation=45)
    axes[3].annotate("Soil moisture", (0.02,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    # axes[3].set_ylim([20,50])
    axes[3].set_xlabel("Time (day of year)")

    if "Precipitation" in experiment.df_forcing.columns:
        ax2 = axes[3].twinx()
        i0, i1 = experiment.ForcingDataX.time_axis[0]-1, experiment.ForcingDataX.time_axis[-1]
        ax2.bar(model_output[d_fd_mapping['Climate_doy_f']], experiment.df_forcing["Precipitation"].values[i0:i1], color="0.4")
        ax2.set_ylabel("Daily Precipitation\n(mm)")
        axes[3].annotate("Precipitation", (0.98,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='right', fontsize=12)

    axes[0].set_xlim([experiment.PlantX.Management.sowingDays[0],model_output[d_fd_mapping['Climate_doy_f']][-1]])

    plt.tight_layout()
    plt.savefig(f'{experiment.dir_results}{i.xsite}_df_forcing.png')
    plt.close()
        

    fig, axes = plt.subplots(5,1,figsize=(8,10),sharex=True)

    axes[0].plot(model_output['t'], model_output["LAI"])
    axes[0].set_ylabel("LAI\n"+r"($\rm m^2 \; m^{-2}$)")
    axes[0].tick_params(axis='x', labelrotation=45)
    axes[0].annotate("Leaf area index", (0.01,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[0].set_ylim([0,6.5])

    axes[1].plot(model_output["t"], model_output["GPP"])
    axes[1].set_ylabel("GPP\n"+r"($\rm g C \; m^{-2} \; d^{-1}$)")
    axes[1].tick_params(axis='x', labelrotation=45)
    axes[1].annotate("Photosynthesis", (0.01,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[1].set_ylim([0,30])

    axes[2].plot(model_output["t"], model_output["E_mmd"])
    axes[2].set_ylabel(r"$\rm E$"+"\n"+r"($\rm mm \; d^{-1}$)")
    axes[2].tick_params(axis='x', labelrotation=45)
    axes[2].annotate("Transpiration Rate", (0.01,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[2].set_ylim([0,6])

    axes[3].plot(model_output["t"], model_output["Bio_time"])
    axes[3].set_ylabel("Thermal Time\n"+r"($\rm ^{\circ}$C d)")
    axes[3].annotate("Growing Degree Days", (0.01,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)

    alp = 0.6
    axes[4].plot(model_output["t"], model_output["Cleaf"]+model_output["Croot"]+model_output["Cstem"]+model_output["Cseed"],c='k',label="Plant", alpha=alp)
    axes[4].plot(model_output["t"], model_output["Cleaf"],label="Leaf", alpha=alp)
    axes[4].plot(model_output["t"], model_output["Cstem"],label="Stem", alpha=alp)
    axes[4].plot(model_output["t"], model_output["Croot"],label="Root", alpha=alp)
    axes[4].plot(model_output["t"], model_output["Cseed"],label="Seed", alpha=alp)
    axes[4].set_ylabel("Carbon Pool Size\n"+r"(g C $\rm m^{-2}$)")
    axes[4].set_xlabel("Time (day of year)")
    axes[4].legend(loc=3,fontsize=9,handlelength=0.8)

    # Time indexing for model output data, to determine outputs at specific times in the growing season
    itax_sowing, itax_mature, itax_harvest, itax_phase_transitions = experiment.PlantX.Site.time_index_growing_season(experiment.ForcingDataX.time_index, model_output['idevphase_numeric'], experiment.PlantX.Management, experiment.PlantX.PlantDev)
    harvest_index_maturity = model_output["Cseed"][itax_harvest] / (model_output["Cleaf"][itax_mature]+model_output["Croot"][itax_mature]+model_output["Cstem"][itax_mature])
    yield_from_seed_Cpool = model_output["Cseed"][itax_harvest]/100 * (1/experiment.PlantX.PlantCH2O.f_C)   ## convert gC m-2 to t dry biomass ha-1
    axes[4].annotate("Yield = %1.2f t/ha" % (yield_from_seed_Cpool), (0.01,0.93), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)
    axes[4].annotate("Harvest index = %1.2f" % (harvest_index_maturity), (0.01,0.81), xycoords='axes fraction', verticalalignment='top', horizontalalignment='left', fontsize=12)

    axes[0].set_xlim([experiment.PlantX.Management.sowingDays[0],model_output[d_fd_mapping['Climate_doy_f']][-1]])

    plt.tight_layout()
    plt.savefig(f'{experiment.dir_results}{i.xsite}_output.png')
    plt.close()

    daesim_json = build_daesim_plot_json(model_output, experiment, d_fd_mapping, yield_from_seed_Cpool, harvest_index_maturity)
    print(f'{experiment.dir_results}{i.xsite}_plot.json')
    dump(daesim_json, open(f'{experiment.dir_results}{i.xsite}_plot.json', 'w'))
