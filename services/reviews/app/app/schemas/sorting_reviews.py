from enum import Enum
from typing import Optional

from pydantic import BaseModel
from app.schemas import SortingDir


class ReviewsSortingModel(str, Enum):
    created = "created"
    rating = "rating"


class SortingReviews(BaseModel):
    sort: Optional[ReviewsSortingModel]
    sort_dir: Optional[SortingDir]
