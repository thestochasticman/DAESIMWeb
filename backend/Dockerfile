# The backend runs on the host's conda env `paddockts-env` (Python 3.11,
# paddocktimeseries native stack + SALib) and the volume-mounted checkouts of
# paddocktimeseries, DAESIM and daesim2-analysis (see compose.yml). Nothing is
# installed in the image, so package changes only need a container restart.
FROM ubuntu:22.04
SHELL ["bash", "-lc"]

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates git curl tini \
  && rm -rf /var/lib/apt/lists/*

# Container runs as uid 1001 (no /etc/passwd entry), so HOME must be writable.
ENV HOME=/tmp \
    PYTHONUNBUFFERED=1 \
    MPLBACKEND=Agg \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PATH=/opt/conda/envs/paddockts-env/bin:/opt/conda/bin:$PATH

WORKDIR /app
COPY backend/ /app

EXPOSE 2000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "2000"]
