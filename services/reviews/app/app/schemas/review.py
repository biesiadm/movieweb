from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


class Info(BaseModel):
    count: int
    totalCount: int


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
    created: datetime

    class Config:
        orm_mode = True


class ReviewsInfo(BaseModel):
    reviews: List[Review]
    info: Info
    
    class Config:
        orm_mode = True
