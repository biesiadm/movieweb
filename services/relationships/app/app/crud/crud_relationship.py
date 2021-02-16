from operator import attrgetter
from typing import List
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import Relationship
from app.schemas import RelationshipCreate, RelationshipUpdate, SortingDir, RelationshipsSortingModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timezone


def determine_relationships_sorting_type(sort: RelationshipsSortingModel, sort_dir: SortingDir):
    sorting_method = None

    if sort == RelationshipsSortingModel.created:
        sorting_method = Relationship.created.desc() if sort_dir == SortingDir.desc else Relationship.created.asc()

    return sorting_method


def sort_relationships_manually(query_result, sort: RelationshipsSortingModel, sort_dir: SortingDir):
    if sort == RelationshipsSortingModel.created:
        query_result = sorted(query_result, key=attrgetter('created'), reverse=(sort_dir == SortingDir.desc))

    return query_result


def calculate_total_counts(counts) -> int:
    total_counts = 0

    for c in counts:
        total_counts += c[0]

    return total_counts


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
                           limit: int = 100, user_id: UUID,
                           sort: RelationshipsSortingModel, sort_dir: SortingDir) -> List[Relationship]:
        query_result = db.query(self.model).filter(Relationship.followed_user_id == user_id) \
            .offset(skip).limit(limit).all()

        return sort_relationships_manually(query_result, sort, sort_dir)

    def get_following_by_user(self, db: Session, *, skip: int = 0,
                              limit: int = 100, user_id: UUID,
                              sort: RelationshipsSortingModel, sort_dir: SortingDir) -> List[Relationship]:
        return db.query(self.model).filter(Relationship.user_id == user_id) \
            .order_by(determine_relationships_sorting_type(sort, sort_dir)).offset(skip).limit(limit).all()

    def get_relationship(self, db: Session, *, user_id: UUID, followed_user_id: UUID):
        return db.query(self.model).filter(Relationship.user_id == user_id,
                                           Relationship.followed_user_id == followed_user_id).first()

    def count_following_by_user(self, db: Session, *, user_id: UUID):
        counts = db.query(func.count(Relationship.id)).filter(Relationship.user_id == user_id).all()
        return calculate_total_counts(counts)

    def count_user_followers(self, db: Session, *, user_id: UUID) -> int:
        counts = db.query(func.count(Relationship.id)).filter(Relationship.followed_user_id == user_id).all()
        return calculate_total_counts(counts)


relationship = CRUDReview(Relationship)
