from pydantic import BaseModel, field_validator, model_validator
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

    @model_validator(mode="after")
    def _season_is_ordered(self):
        if self.harvest_date <= self.sowing_date:
            raise ValueError("harvest_date must be after sowing_date")
        return self
