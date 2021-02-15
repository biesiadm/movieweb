from typing import List, Optional
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import Review
from app.schemas import ReviewCreate, ReviewUpdate, SortingDir, ReviewsSortingModel, MoviesSortingModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timezone


def determine_reviews_sorting_type(sort: ReviewsSortingModel, sort_dir: SortingDir):
    sorting_method = None

    if sort == ReviewsSortingModel.rating:
        sorting_method = Review.rating.desc() if sort_dir == SortingDir.desc else Review.rating.asc()
    elif sort == ReviewsSortingModel.created:
        sorting_method = Review.created.desc() if sort_dir == SortingDir.desc else Review.created.asc()

    return sorting_method


def determine_movies_sorting_type(sort: MoviesSortingModel, sort_dir: SortingDir):
    sorting_method = None

    if sort == MoviesSortingModel.rating_count:
        sorting_method = func.count(Review.id).desc() if sort_dir == SortingDir.desc else func.count(Review.id).asc()
    elif sort == MoviesSortingModel.avg_rating:
        sorting_method = func.avg(Review.rating).desc() if sort_dir == SortingDir.desc else func.avg(
            Review.rating).asc()

    return sorting_method


def determine_filter_type(created_gte: Optional[datetime], user_id: Optional[List[UUID]]):
    filter_type = None

    if created_gte and user_id:
        filter_type = [Review.created >= created_gte, Review.user_id.in_(user_id)]
    elif created_gte:
        filter_type = [Review.created >= created_gte]
    elif user_id:
        filter_type = [Review.user_id.in_(user_id)]

    return filter_type


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

    def get_by_user(self, db: Session, *, skip: int = 0, limit: int = 100,
                    user_id: UUID, sort: ReviewsSortingModel, sort_dir: SortingDir) -> List[Review]:
        return db.query(self.model).filter(Review.user_id == user_id) \
            .order_by(determine_reviews_sorting_type(sort, sort_dir)).offset(skip).limit(limit).all()

    def get_by_movie(self, db: Session, *, skip: int = 0, limit: int = 100,
                     movie_id: UUID, sort: ReviewsSortingModel, sort_dir: SortingDir) -> List[Review]:
        return db.query(self.model).filter(Review.movie_id == movie_id) \
            .order_by(determine_reviews_sorting_type(sort, sort_dir)).offset(skip).limit(limit).all()

    def get_by_user_and_movie(self, db: Session, *, user_id: UUID, movie_id: UUID) -> Review:
        return db.query(self.model).filter(Review.user_id == user_id, Review.movie_id == movie_id).first()

    def get_multi_sort(self, db: Session, *, skip: int = 0, limit: int = 100,
                       sort: ReviewsSortingModel, sort_dir: SortingDir,
                       created_gte: Optional[datetime], user_id: Optional[List[UUID]]) -> List[Review]:
        if not user_id and not created_gte:
            return db.query(self.model).order_by(determine_reviews_sorting_type(sort, sort_dir)) \
                .offset(skip).limit(limit).all()
        else:
            return db.query(self.model).filter(*determine_filter_type(created_gte, user_id)) \
                .order_by(determine_reviews_sorting_type(sort, sort_dir)).offset(skip).limit(limit).all()

    def get_average_by_movie(self, db: Session, *, movie_id: UUID):
        return db.query(self.model).with_entities(func.avg(Review.rating)).filter(Review.movie_id == movie_id).first()

    def get_count_by_movie(self, db: Session, *, movie_id: UUID):
        return db.query(self.model).with_entities(func.count(Review.rating)).filter(Review.movie_id == movie_id).first()

    def get_average_by_user(self, db: Session, *, user_id: UUID):
        return db.query(self.model).with_entities(func.avg(Review.rating)).filter(Review.user_id == user_id).first()

    def get_count_by_user(self, db: Session, *, user_id: UUID):
        return db.query(self.model).with_entities(func.count(Review.rating)).filter(Review.user_id == user_id).first()

    def get_movies_sort(self, db: Session, *, skip: int = 0, limit: int = 100,
                        sort: ReviewsSortingModel, sort_dir: SortingDir) -> List[UUID]:
        return db.query(self.model.movie_id).group_by(Review.movie_id) \
            .order_by(determine_movies_sorting_type(sort, sort_dir)).offset(skip).limit(limit).all()


review = CRUDReview(Review)
