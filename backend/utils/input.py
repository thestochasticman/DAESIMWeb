from pydantic import BaseModel
from pandas import Timestamp
from datetime import date
from dataclasses import dataclass
from dataclasses_json import dataclass_json


class Input(BaseModel):
    xsite: str
    lat: float
    lon: float
    sowing_date: date
    harvest_date: date
    crop_type: str

@dataclass_json
@dataclass
class Input:
    xsite: str
    lat: float
    lon: float
    sowing_date: date
    harvest_date: date
    crop_type: str


