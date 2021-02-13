from enum import Enum
from typing import Optional

from pydantic import BaseModel


class SortingModel(str, Enum):
    created = "created"
    rating = "rating"


class SortingDir(str, Enum):
    desc = "desc"
    asc = "asc"


class SortingSettings(BaseModel):
    sort: Optional[SortingModel]
    sort_dir: Optional[SortingDir]
