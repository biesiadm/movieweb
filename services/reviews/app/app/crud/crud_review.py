from typing import List
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import Review
from app.schemas import ReviewCreate, ReviewUpdate
from sqlalchemy.orm import Session
from datetime import datetime, timezone


class CRUDReview(CRUDBase[Review, ReviewCreate, ReviewUpdate]):
    def create(self, db: Session, *, obj_in: ReviewCreate):
        db_obj = Review(
            user_id=obj_in.user_id,
            movie_id=obj_in.movie_id,
            rating=obj_in.rating,
            comment=obj_in.comment,
            created=datetime.now(timezone.utc)
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_with_date(self, db: Session, *, obj_in: ReviewCreate, creation_time: datetime):
        db_obj = Review(
            user_id=obj_in.user_id,
            movie_id=obj_in.movie_id,
            rating=obj_in.rating,
            comment=obj_in.comment,
            created=creation_time
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(self, db: Session, *, skip: int = 0,
                    limit: int = 100, user_id: UUID) -> List[Review]:
        return db.query(self.model).filter(Review.user_id == user_id) \
            .offset(skip).limit(limit).all()

    def get_by_movie(self, db: Session, *, skip: int = 0,
                     limit: int = 100, movie_id: UUID) -> List[Review]:
        return db.query(self.model).filter(Review.movie_id == movie_id) \
            .offset(skip).limit(limit).all()

    def get_by_user_and_movie(self, db: Session, *, user_id: UUID, movie_id: UUID) -> Review:
        return db.query(self.model).filter(Review.user_id == user_id, Review.movie_id == movie_id).first()


review = CRUDReview(Review)
