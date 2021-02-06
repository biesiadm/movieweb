from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


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
