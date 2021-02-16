from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel


class Info(BaseModel):
    count: int
    totalCount: int


class RelationshipBase(BaseModel):
    user_id: UUID
    followed_user_id: UUID


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipUpdate(RelationshipBase):
    pass


class Relationship(RelationshipBase):
    id: UUID
    created: datetime

    class Config:
        orm_mode = True


class RelationshipsInfo(BaseModel):
    relationships: List[Relationship]
    info: Info
    
    class Config:
        orm_mode = True
