from enum import Enum


class SortingModel(str, Enum):
    created = "created"
    rating = "rating"


class SortingDir(str, Enum):
    desc = "desc"
    asc = "asc"
