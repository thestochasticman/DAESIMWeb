# The backend runs on the host's conda env `paddockts-env` (Python 3.11,
# paddocktimeseries native stack + backend/requirements-paddockts-env.txt) and
# the volume-mounted checkouts of paddocktimeseries, DAESIM and daesim2-analysis
# (see compose.yml). Nothing is installed in the image, so package changes only
# need a container restart. Runtime settings that do not depend on the
# deployment live here; compose.yml adds only paths, troi config and origins.
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Container runs as uid 1001 (no /etc/passwd entry), so HOME must be writable
# and some libs fall back to $USER.
ENV HOME=/tmp \
    USER=yasar \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    PYTHONUNBUFFERED=1 \
    PYTHONNOUSERSITE=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    MPLBACKEND=Agg \
    HDF5_USE_FILE_LOCKING=FALSE \
    PATH=/opt/conda/envs/paddockts-env/bin:/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    GDAL_DATA=/opt/conda/envs/paddockts-env/share/gdal \
    PROJ_LIB=/opt/conda/envs/paddockts-env/share/proj

WORKDIR /app
COPY backend/ /app

EXPOSE 2000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "2000"]
