import numpy as np

def build_daesim_plot_json(model_output, experiment, d_fd_mapping, yield_t_ha, harvest_index):
    """Builds the full DAESIM plot JSON schema for the frontend."""

    doy = model_output[d_fd_mapping['Climate_doy_f']].tolist()

    # Compute derived quantities
    sol_global = (
        model_output[d_fd_mapping['Climate_solRadswskyb_f']] +
        model_output[d_fd_mapping['Climate_solRadswskyd_f']]
    )
    leaf_tempC = experiment.PlantX.Site.compute_skin_temp(
        (model_output[d_fd_mapping['Climate_airTempCMin_f']] + model_output[d_fd_mapping['Climate_airTempCMax_f']]) / 2,
        sol_global
    )
    air_avg = (
        model_output[d_fd_mapping['Climate_airTempCMin_f']] +
        model_output[d_fd_mapping['Climate_airTempCMax_f']]
    ) / 2

    # ---- Numeric arrays ----
    forcing = {
        "doy": doy,
        "solRad_global": sol_global.tolist(),
        "solRad_direct": model_output[d_fd_mapping['Climate_solRadswskyb_f']].tolist(),
        "solRad_diffuse": model_output[d_fd_mapping['Climate_solRadswskyd_f']].tolist(),
        "temp_min": model_output[d_fd_mapping['Climate_airTempCMin_f']].tolist(),
        "temp_max": model_output[d_fd_mapping['Climate_airTempCMax_f']].tolist(),
        "leaf_temp": leaf_tempC.tolist(),
        "air_avg": air_avg.tolist(),
        "rh": model_output[d_fd_mapping['Climate_airRH_f']].tolist(),
        "soil_layers": {
            f"z{iz}": (100 * model_output[f"{d_fd_mapping['Climate_soilTheta_z_f']} z{iz}"]).tolist()
            for iz in range(experiment.PlantX.PlantCH2O.SoilLayers.nlevmlsoil)
        },
        "precip": (
            experiment.df_forcing["Precipitation"].tolist()
            if "Precipitation" in experiment.df_forcing.columns
            else []
        )
    }

    outputs = {
        "t": model_output["t"].tolist(),
        "LAI": model_output["LAI"].tolist(),
        "GPP": model_output["GPP"].tolist(),
        "E_mmd": model_output["E_mmd"].tolist(),
        "Bio_time": model_output["Bio_time"].tolist(),
        "Cleaf": model_output["Cleaf"].tolist(),
        "Cstem": model_output["Cstem"].tolist(),
        "Croot": model_output["Croot"].tolist(),
        "Cseed": model_output["Cseed"].tolist(),
        "Cplant": (
            model_output["Cleaf"] +
            model_output["Cstem"] +
            model_output["Croot"] +
            model_output["Cseed"]
        ).tolist(),
        "yield_t_ha": float(yield_t_ha),
        "harvest_index": float(harvest_index)
    }

    # ---- Plot metadata (subplots) ----
    forcing_subplots = [
        {
            "id": "solar",
            "title": "Solar radiation",
            "yaxis_label": "Solar radiation (W m⁻²)",
            "series": [
                {"key": "solRad_global", "label": "Global", "color": "gray"},
                {"key": "solRad_direct", "label": "Direct", "color": "goldenrod", "alpha": 0.5},
                {"key": "solRad_diffuse", "label": "Diffuse", "color": "blue", "alpha": 0.5}
            ],
            "ylim": [0, 400]
        },
        {
            "id": "temperature",
            "title": "Air temperature",
            "yaxis_label": "Air Temperature (°C)",
            "series": [
                {"key": "temp_min", "label": "Min", "color": "lightsteelblue"},
                {"key": "temp_max", "label": "Max", "color": "indianred"},
                {"key": "leaf_temp", "label": "Leaf", "color": "darkgreen"},
                {"key": "air_avg", "label": "Air", "color": "gray"}
            ],
            "ylim": [-5, 45]
        },
        {
            "id": "humidity",
            "title": "Relative humidity",
            "yaxis_label": "Relative Humidity (%)",
            "series": [{"key": "rh", "label": "RH", "color": "gray"}]
        },
        {
            "id": "soil",
            "title": "Soil moisture and precipitation",
            "yaxis_label": "Soil Moisture (%)",
            "series": [
                {"key_prefix": "soil_layers", "label": "Soil Layer", "palette": "grayscale"}
            ],
            "secondary_yaxis": {
                "key": "precip",
                "label": "Daily Precipitation (mm)",
                "type": "bar",
                "color": "gray"
            },
            "xlabel": "Time (day of year)"
        }
    ]

    outputs_subplots = [
        {
            "id": "lai",
            "title": "Leaf area index",
            "yaxis_label": "LAI (m² m⁻²)",
            "series": [{"key": "LAI", "label": "LAI", "color": "green"}],
            "ylim": [0, 6.5]
        },
        {
            "id": "gpp",
            "title": "Photosynthesis",
            "yaxis_label": "GPP (g C m⁻² d⁻¹)",
            "series": [{"key": "GPP", "label": "GPP", "color": "blue"}],
            "ylim": [0, 30]
        },
        {
            "id": "transpiration",
            "title": "Transpiration Rate",
            "yaxis_label": "E (mm d⁻¹)",
            "series": [{"key": "E_mmd", "label": "E", "color": "red"}],
            "ylim": [0, 6]
        },
        {
            "id": "thermal",
            "title": "Growing Degree Days",
            "yaxis_label": "Thermal Time (°C·d)",
            "series": [{"key": "Bio_time", "label": "Thermal", "color": "orange"}]
        },
        {
            "id": "carbon",
            "title": "Carbon Pools",
            "yaxis_label": "Carbon Pool Size (g C m⁻²)",
            "xlabel": "Time (day of year)",
            "series": [
                {"key": "Cplant", "label": "Plant", "color": "black", "alpha": 0.6},
                {"key": "Cleaf", "label": "Leaf", "color": "green", "alpha": 0.6},
                {"key": "Cstem", "label": "Stem", "color": "brown", "alpha": 0.6},
                {"key": "Croot", "label": "Root", "color": "purple", "alpha": 0.6},
                {"key": "Cseed", "label": "Seed", "color": "orange", "alpha": 0.6}
            ],
            "annotations": [
                {"text": f"Yield = {yield_t_ha:.2f} t/ha", "x": 0.01, "y": 0.93, "anchor": "top-left"},
                {"text": f"Harvest index = {harvest_index:.2f}", "x": 0.01, "y": 0.81, "anchor": "top-left"}
            ]
        }
    ]

    # Combine
    plot_json = {
        "forcing": {**forcing, "subplots": forcing_subplots},
        "outputs": {**outputs, "subplots": outputs_subplots}
    }

    return plot_json
