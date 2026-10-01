from pydantic import BaseModel, field_validator
from datetime import date


class Input(BaseModel):
    """Request body for POST /run (matches frontend/components/QueryPanel.tsx)."""
    xsite: str
    lat: float
    lon: float
    sowing_date: date
    harvest_date: date
    crop_type: str

    @field_validator("crop_type")
    @classmethod
    def _capitalise(cls, v: str) -> str:
        return v.capitalize()
