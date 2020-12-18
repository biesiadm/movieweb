from typing import Optional

from pydantic import BaseModel


class MovieBase(BaseModel):
    title: str
    director: str
    year: int
    country: str
    budget: Optional[int] = None
    box_office: Optional[int] = None
    category: str
    original_language: Optional[str] = None


class MovieCreate(MovieBase):
    pass


class MovieUpdate(MovieBase):
    pass


class Movie(MovieBase):
    id: int

    class Config:
        orm_mode = True
