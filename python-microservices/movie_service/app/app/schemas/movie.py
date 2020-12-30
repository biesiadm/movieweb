from typing import Optional

from pydantic import BaseModel
from pydantic.types import UUID


class MovieBase(BaseModel):
    title: str
    director: str
    year: int
    country: str
    category: str


class MovieCreate(MovieBase):
    pass


class MovieUpdate(MovieBase):
    pass


class Movie(MovieBase):
    id: UUID

    class Config:
        orm_mode = True
