from typing import List, Any

from app import schemas, crud
from app.api import deps
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[schemas.Movie])
def read_movies(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
) -> Any:
    movies = crud.movie.get_multi(db, skip=skip, limit=limit)

    return movies


@router.post("/", response_model=schemas.Movie)
def create_movie(
        *,
        db: Session = Depends(deps.get_db),
        movie_in: schemas.MovieCreate
) -> Any:
    movie = crud.movie.create(db, obj_in=movie_in)

    return movie


@router.get("/title", response_model=List[schemas.Movie])
def read_movies_by_title(
        title: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_title(db=db, title=title)

    return movies


@router.get("/director", response_model=List[schemas.Movie])
def read_movies_by_director(
        director: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_director(db=db, director=director)

    return movies


@router.get("/category", response_model=List[schemas.Movie])
def read_movies_by_director(
        category: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_category(db=db, category=category)

    return movies


@router.get("/country", response_model=List[schemas.Movie])
def read_movies_by_director(
        country: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_country(db=db, country=country)

    return movies
