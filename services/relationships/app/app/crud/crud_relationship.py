from typing import List
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import Relationship
from app.schemas import RelationshipCreate, RelationshipUpdate
from sqlalchemy.orm import Session
from datetime import datetime, timezone


class CRUDReview(CRUDBase[Relationship, RelationshipCreate, RelationshipUpdate]):
    def create(self, db: Session, *, obj_in: RelationshipCreate):
        db_obj = Relationship(
            user_id=obj_in.user_id,
            followed_user_id=obj_in.followed_user_id,
            created=datetime.now(timezone.utc)
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_user_followers(self, db: Session, *, skip: int = 0,
                           limit: int = 100, user_id: UUID) -> List[Relationship]:
        return db.query(self.model).filter(Relationship.followed_user_id == user_id) \
            .offset(skip).limit(limit).all()

    def get_following_by_user(self, db: Session, *, skip: int = 0,
                              limit: int = 100, user_id: UUID) -> List[Relationship]:
        return db.query(self.model).filter(Relationship.user_id == user_id) \
            .offset(skip).limit(limit).all()

    def get_relationship(self, db: Session, *, user_id: UUID, followed_user_id: UUID):
        return db.query(self.model).filter(Relationship.user_id == user_id,
                                           Relationship.followed_user_id == followed_user_id).first()


relationship = CRUDReview(Relationship)
