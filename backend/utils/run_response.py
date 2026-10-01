from pydantic import BaseModel


class RunResponse(BaseModel):
    job_id: str
    status: str = "running"  # running | done
