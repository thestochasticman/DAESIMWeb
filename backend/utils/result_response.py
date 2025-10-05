from pydantic import BaseModel
from typing import Dict
from typing import List
from typing import Any

class ResultResponse(BaseModel):
    status: str
    plots: List[str]
    meta: Dict[str, Any]