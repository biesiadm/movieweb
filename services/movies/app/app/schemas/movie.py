from typing import Optional, List

from pydantic import BaseModel, AnyUrl
from uuid import UUID


class Info(BaseModel):
    count: int
    totalCount: int


class MovieBase(BaseModel):
    title: str
    poster_url: AnyUrl
    background_url: Optional[AnyUrl]
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


class MoviesInfo(BaseModel):
    movies: List[Movie]
    info: Info

    class Config:
        orm_mode = True
