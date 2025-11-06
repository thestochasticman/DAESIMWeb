FROM continuumio/miniconda3:latest
SHELL ["bash","-lc"]

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

COPY backend/env.yml /tmp/env.yml
RUN conda env create -f /tmp/env.yml && conda clean -afy

ENV PATH=/opt/conda/envs/PaddockTSEnv/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    MPLBACKEND=Agg

RUN /opt/conda/envs/PaddockTSEnv/bin/python -c "import uvicorn, fastapi; print('runtime ok')"

WORKDIR /app
COPY backend/ /app/


EXPOSE 2000

CMD ["/opt/conda/envs/PaddockTSEnv/bin/uvicorn","main:app","--host","0.0.0.0","--port","2000"]
