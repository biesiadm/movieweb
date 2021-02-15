from enum import Enum
from typing import Optional

from pydantic import BaseModel
from app.schemas import SortingDir


class MoviesSortingModel(str, Enum):
    avg_rating = "avg_rating"
    rating_count = "rating_count"


class SortingMovies(BaseModel):
    sort: Optional[MoviesSortingModel]
    sort_dir: Optional[SortingDir]
