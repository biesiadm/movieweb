from pydantic import BaseModel


class MovieStatus(BaseModel):
    status: str
