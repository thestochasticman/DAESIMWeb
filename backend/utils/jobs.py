"""Job identity, status files and run de-duplication for the DAESIM backend.

A job is identified by what determines its output: the troi stub (snapped
bbox + dates, see ``troi.Troi``), the crop type, and the contents of the
DAESIM config and parameter files. The user's ``xsite`` is only a label.
Results live in ``RESULTS_DIR/{key}/`` as ``plot.json``, ``meta.json``,
``status.json`` and the PNGs.

Concurrency: a bounded thread pool runs the model; an in-process set stops the
same key being submitted twice, and a per-job ``flock`` stops a second
process (another uvicorn worker, or a restarted one) from re-running a job
that is still in flight elsewhere. Status files are written atomically so a
reader never sees a half-written file.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Callable, Optional
import fcntl
import json
import os
import threading
import traceback

BACKEND_DIR = Path(__file__).resolve().parents[1]
DAESIM_CONFIG = BACKEND_DIR / "daesim_configs" / "DAESIM1.json"
PARAMETERS = BACKEND_DIR / "parameters" / "PARAMS1.json"

RUNNING, DONE, ERROR = "running", "done", "error"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _file_digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def job_key(troi_stub: str, crop_type: str) -> str:
    """Stable id for (site, season, crop, model configuration)."""
    parts = [troi_stub, crop_type, _file_digest(DAESIM_CONFIG), _file_digest(PARAMETERS)]
    return sha256("|".join(parts).encode()).hexdigest()[:32]


def write_json_atomic(path: Path, obj) -> None:
    path = Path(path)
    tmp = path.with_name(path.name + ".part")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def read_json(path: Path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


class Jobs:
    def __init__(self, results_dir: Path, max_workers: int = 2):
        self.results_dir = Path(results_dir)
        self.pool = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="daesim")
        self._running: set[str] = set()
        self._lock = threading.Lock()

    # ---- paths ----
    def dir(self, key: str) -> Path: return self.results_dir / key
    def plot_path(self, key: str) -> Path: return self.dir(key) / "plot.json"
    def meta_path(self, key: str) -> Path: return self.dir(key) / "meta.json"
    def status_path(self, key: str) -> Path: return self.dir(key) / "status.json"
    def lock_path(self, key: str) -> Path: return self.dir(key) / ".lock"

    # ---- queries ----
    def status(self, key: str) -> Optional[dict]:
        """None if the job is unknown; otherwise {"status": running|done|error, ...}."""
        if self.plot_path(key).exists():
            return {**(read_json(self.status_path(key)) or {}), "status": DONE}
        return read_json(self.status_path(key))

    # ---- submission ----
    def submit(self, key: str, fn: Callable, *args) -> str:
        """Run ``fn(*args)`` for ``key`` unless its result exists or it is already
        in flight in this process. Returns the job's status after the call."""
        self.dir(key).mkdir(parents=True, exist_ok=True)
        if self.plot_path(key).exists():
            return DONE
        with self._lock:
            if key in self._running:
                return RUNNING
            self._running.add(key)
        # Status exists from the moment the job is accepted, so /results never
        # 404s in the gap before a pool thread picks the job up.
        write_json_atomic(self.status_path(key), {"status": RUNNING, "queued": _now()})
        self.pool.submit(self._run, key, fn, args)
        return RUNNING

    def _run(self, key: str, fn: Callable, args: tuple) -> None:
        try:
            with open(self.lock_path(key), "w") as lock:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except BlockingIOError:
                    return  # another process holds this job; its status file is authoritative
                try:
                    if self.plot_path(key).exists():
                        return
                    write_json_atomic(self.status_path(key), {**(read_json(self.status_path(key)) or {}), "status": RUNNING, "started": _now()})
                    try:
                        fn(*args)
                    except Exception as e:  # noqa: BLE001 - surface anything to /results
                        traceback.print_exc()
                        write_json_atomic(self.status_path(key), {
                            "status": ERROR,
                            "error": f"{type(e).__name__}: {e}",
                            "traceback": traceback.format_exc(),
                            "finished": _now(),
                        })
                        return
                    write_json_atomic(self.status_path(key), {"status": DONE, "finished": _now()})
                finally:
                    fcntl.flock(lock, fcntl.LOCK_UN)
        finally:
            with self._lock:
                self._running.discard(key)
