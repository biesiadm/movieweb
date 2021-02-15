from typing import Generator, Optional

from fastapi import HTTPException, status

from app.schemas import SortingDir, ReviewsSortingModel, SortingReviews, MoviesSortingModel, SortingMovies
from app.db.session import SessionLocal


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def check_reviews_sorting(sort: Optional[str] = None, sort_dir: Optional[str] = None):
    try:
        if sort:
            ReviewsSortingModel(sort)
            SortingDir(sort_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid sorting method, available are'
                   f' sort: {[e.value for e in ReviewsSortingModel]} and'
                   f' sort_dir: {[e.value for e in SortingDir]}.'
        )

    return SortingReviews(sort=None, sort_dir=None) if sort is None else\
        SortingReviews(sort=ReviewsSortingModel(sort), sort_dir=SortingDir(sort_dir))


def check_movies_sorting(sort: Optional[str] = None, sort_dir: Optional[str] = None):
    try:
        if sort:
            MoviesSortingModel(sort)
            SortingDir(sort_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid sorting method, available are'
                   f' sort: {[e.value for e in MoviesSortingModel]} and'
                   f' sort_dir: {[e.value for e in SortingDir]}.'
        )

    return SortingMovies(sort=None, sort_dir=None) if sort is None else\
        SortingMovies(sort=MoviesSortingModel(sort), sort_dir=SortingDir(sort_dir))
