from typing import List, Any
from uuid import UUID

from app import schemas, crud
from app.api import deps
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/",
            response_model=schemas.MoviesInfo
            )
def read_movies(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.SortingMovies = Depends(deps.check_movies_sorting)
) -> Any:
    """
    Retrieve movies.
    """
    movies = crud.movie.get_multi_sort(db, skip=skip, limit=limit,
                                       sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)

    total_count = crud.movie.count(db)
    info = schemas.Info(count=len(movies), totalCount=total_count)

    return schemas.MoviesInfo(movies=movies, info=info)


@router.get("/{movie_id}", response_model=schemas.Movie)
def read_movie_by_id(
        movie_id: UUID,
        db: Session = Depends(deps.get_db)
) -> Any:
    movie = crud.movie.get(db, id=movie_id)

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie with this id does not exist"
        )

    return movie


@router.get("/title/{title}", response_model=List[schemas.Movie])
def read_movies_by_title(
        title: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_title(db=db, title=title)

    return movies


@router.get("/director/{director}", response_model=List[schemas.Movie])
def read_movies_by_director(
        director: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_director(db=db, director=director)

    return movies


@router.get("/category/{category}", response_model=List[schemas.Movie])
def read_movies_by_category(
        category: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_category(db=db, category=category)

    return movies


@router.get("/country/{country}", response_model=List[schemas.Movie])
def read_movies_by_country(
        country: str,
        db: Session = Depends(deps.get_db)
) -> Any:
    movies = crud.movie.get_by_country(db=db, country=country)

    return movies


@router.post("/add", response_model=schemas.Movie)
def create_movie(
        db: Session = Depends(deps.get_db),
        *,
        movie_in: schemas.MovieCreate
) -> Any:
    movie = crud.movie.create(db=db, obj_in=movie_in)

    return movie
