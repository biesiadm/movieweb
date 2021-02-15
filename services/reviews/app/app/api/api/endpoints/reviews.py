from typing import List, Any, Optional
from uuid import UUID

from app import schemas, crud
from app.api import deps
from app.db import models
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic.schema import datetime
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/reviews", response_model=List[schemas.Review])
def read_all_reviews(
        db: Session = Depends(deps.get_db),
        *,
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.SortingReviews = Depends(deps.check_reviews_sorting),
        created_gte: Optional[datetime] = None,
        user_id: Optional[List[UUID]] = Query(None)
) -> Any:
    reviews = crud.review.get_multi_sort(db=db, skip=skip, limit=limit,
                                         sort=sort_settings.sort, sort_dir=sort_settings.sort_dir,
                                         created_gte=created_gte, user_id=user_id)
    return reviews


@router.get("/movies", response_model=List[UUID])
def read_movies(
        db: Session = Depends(deps.get_db),
        *,
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.SortingMovies = Depends(deps.check_movies_sorting)
) -> Any:
    movies = crud.review.get_movies_sort(db=db, skip=skip, limit=limit,
                                         sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)

    return [movie_id for movie_id_list in movies for movie_id in movie_id_list]


@router.get("/movie/{movie_id}/avg", response_model=Optional[float])
def read_avg_by_movie(
        db: Session = Depends(deps.get_db),
        *,
        movie_id: UUID
) -> Any:
    avg_rating = crud.review.get_average_by_movie(db=db, movie_id=movie_id)

    return avg_rating[0]


@router.get("/movie/{movie_id}/count", response_model=Optional[int])
def read_count_by_movie(
        db: Session = Depends(deps.get_db),
        *,
        movie_id: UUID
) -> Any:
    rating_count = crud.review.get_count_by_movie(db=db, movie_id=movie_id)

    return rating_count[0]


@router.get("/user/{user_id}/avg", response_model=Optional[float])
def read_avg_by_user(
        db: Session = Depends(deps.get_db),
        *,
        user_id: UUID
) -> Any:
    avg_rating = crud.review.get_average_by_user(db=db, user_id=user_id)

    return avg_rating[0]


@router.get("/user/{user_id}/count", response_model=Optional[int])
def read_count_by_user(
        db: Session = Depends(deps.get_db),
        *,
        user_id: UUID
) -> Any:
    rating_count = crud.review.get_count_by_user(db=db, user_id=user_id)

    return rating_count[0]


@router.get("/movie/{movie_id}/reviews", response_model=List[schemas.Review])
def read_movie_reviews(
        movie_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.ReviewsSortingModel = Depends(deps.check_reviews_sorting)
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.review.get_by_movie(db, movie_id=movie_id, skip=skip, limit=limit,
                                       sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)
    return reviews


@router.get("/user/{user_id}/reviews", response_model=List[schemas.Review])
def read_user_reviews(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.ReviewsSortingModel = Depends(deps.check_reviews_sorting)
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.review.get_by_user(db, user_id=user_id, skip=skip, limit=limit,
                                      sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)
    return reviews


@router.post("/new", response_model=schemas.Review)
def add_review(
        db: Session = Depends(deps.get_db),
        *,
        review_in: schemas.ReviewCreate
) -> Any:
    review = crud.review.get_by_user_and_movie(db=db, user_id=review_in.user_id, movie_id=review_in.movie_id)

    if review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='You already reviewed this movie.'
        )

    review = crud.review.create(db=db, obj_in=review_in)
    return review


@router.delete("/review/{review_id}/delete", response_model=schemas.Review)
def delete_review(
        review_id: UUID,
        db: Session = Depends(deps.get_db)
) -> Any:
    review = crud.review.get(db=db, id=review_id)

    if not review:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail='Review already deleted.'
        )

    review = crud.review.remove(db=db, id=review_id)

    return review


@router.get("/review/{review_id}", response_model=schemas.Review)
def read_review(
        review_id: UUID,
        db: Session = Depends(deps.get_db)
) -> Any:
    review = crud.review.get(db=db, id=review_id)

    if not review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Review does not exist.'
        )

    return review


@router.get("/movie/{movie_id}/user/{user_id}", response_model=schemas.Review)
def read_review_by_user_and_movie(
        movie_id: UUID,
        user_id: UUID,
        db: Session = Depends(deps.get_db)
) -> Any:
    review = crud.review.get_by_user_and_movie(db=db, user_id=user_id, movie_id=movie_id)

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Review does not exist.'
        )

    return review
