from pydantic import BaseModel
from pandas import Timestamp
from datetime import date

class Input(BaseModel):
    xsite: str
    lat: float
    lon: float
    sowing_date: date
    harvest_date: date
    crop_type: str
