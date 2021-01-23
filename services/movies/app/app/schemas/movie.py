from pydantic import BaseModel, AnyUrl
from uuid import UUID


class MovieBase(BaseModel):
    title: str
    poster_url: AnyUrl
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
