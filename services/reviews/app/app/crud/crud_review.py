from typing import List
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import Review
from app.schemas import ReviewCreate, ReviewUpdate
from sqlalchemy.orm import Session


class CRUDReview(CRUDBase[Review, ReviewCreate, ReviewUpdate]):
    def get_by_user(self, db: Session, *, skip: int = 0,
                    limit: int = 100, user_id: UUID) -> List[Review]:
        return db.query(self.model).filter(Review.user_id == user_id) \
            .offset(skip).limit(limit).all()


review = CRUDReview(Review)
