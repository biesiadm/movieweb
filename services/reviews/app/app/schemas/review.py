from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ReviewBase(BaseModel):
    user_id: UUID
    movie_id: UUID
    rating: int
    comment: Optional[str]


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(ReviewBase):
    pass


class Review(ReviewBase):
    id: UUID

    class Config:
        orm_mode = True
