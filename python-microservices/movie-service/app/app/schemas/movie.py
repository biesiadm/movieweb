from pydantic import BaseModel
from uuid import UUID


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
