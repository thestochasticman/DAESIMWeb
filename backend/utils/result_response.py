from pydantic import BaseModel
from typing import Any, Dict, Optional


class ResultResponse(BaseModel):
    status: str                      # running | done | error
    plots: dict                      # empty unless status == "done"
    meta: Dict[str, Any]
    error: Optional[str] = None      # set when status == "error"
