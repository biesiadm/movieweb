from enum import Enum
from typing import Optional

from pydantic import BaseModel


class SortingModel(str, Enum):
    created = "created"
    rating = "rating"


class SortingDir(str, Enum):
    desc = "desc"
    asc = "asc"


