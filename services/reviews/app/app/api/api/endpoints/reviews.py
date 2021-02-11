from typing import List, Any
from uuid import UUID

from app import schemas, crud
from app.api import deps
from app.db import models
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/movie/{movie_id}/reviews", response_model=List[schemas.Review])
def read_reviews(
        movie_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.review.get_by_movie(db, movie_id=movie_id, skip=skip, limit=limit)
    return reviews


@router.get("/user/{user_id}/reviews", response_model=List[schemas.Review])
def read_reviews(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.review.get_by_user(db, user_id=user_id, skip=skip, limit=limit)
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
