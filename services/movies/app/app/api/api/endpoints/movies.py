from typing import List, Any, Union
from uuid import UUID

from app.core.config import settings
from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import schemas, crud
from app.api import deps
from app.core.celery_app import celery_app

router = APIRouter()


@router.post("/add-async", response_model=schemas.MovieStatus, status_code=status.HTTP_202_ACCEPTED)
def add_movie_async(
        *,
        movie_in: schemas.MovieCreate
) -> Any:
    """
    Add movie asynchronously.
    """
    r = celery_app.send_task("app.worker.test_celery", args=[jsonable_encoder(movie_in)])
    location = f"{settings.API_MOVIES}/status/{r.task_id}"

    return schemas.MovieStatus(status=location)


@router.get("/check-status/{task_id}", response_model=schemas.MovieStatus)
def check_movie_staus(
        task_id: str,
        response: Response
) -> Any:
    res = celery_app.AsyncResult(task_id)

    if res.status == "PENDING":
        response.status_code = status.HTTP_202_ACCEPTED
        location = f"{settings.API_MOVIES}/status/{task_id}"
        return schemas.MovieStatus(status=location)
    elif res.status == "ACCEPTED":
        response.status_code = status.HTTP_303_SEE_OTHER
        location = f"{settings.API_MOVIES}/movie/{res.result}"
        return schemas.MovieStatus(status=location)

    return schemas.MovieStatus(status="Check available movies.")


@router.post("/test-celery/", response_model=schemas.Msg, status_code=202)
def test_celery(
        msg: schemas.Msg,
) -> Any:
    """
    Test Celery worker.
    """
    x = celery_app.send_task("app.worker.test_celery", args=[msg.msg])
    return {"proc_id": x.task_id}


@router.get("/check-celery/{celery_id}",
            # response_model=bool
            )
def check_celery(
        celery_id: str
) -> Any:
    res = celery_app.AsyncResult(celery_id)
    return res.status


@router.get("/", response_model=schemas.MoviesInfo)
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
