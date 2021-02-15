from enum import Enum
from typing import Optional

from pydantic import BaseModel
from app.schemas import SortingDir


class MoviesSortingModel(str, Enum):
    year = "year"
    title = "title"
    country = "country"
    director = "director"
    category = "category"
    

class SortingMovies(BaseModel):
    sort: Optional[MoviesSortingModel]
    sort_dir: Optional[SortingDir]
