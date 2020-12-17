from typing import Optional

from pydantic import BaseModel


class MovieBase(BaseModel):
    title: str


class MovieCreate(MovieBase):
    pass


class MovieUpdate(MovieBase):
    pass


class Movie(MovieBase):
    id: int

    class Config:
        orm_mode = True
