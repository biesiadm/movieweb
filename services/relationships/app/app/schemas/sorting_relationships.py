from enum import Enum
from typing import Optional

from pydantic import BaseModel
from app.schemas import SortingDir


class RelationshipsSortingModel(str, Enum):
    created = "created"


class SortingRelationships(BaseModel):
    sort: Optional[RelationshipsSortingModel]
    sort_dir: Optional[SortingDir]
