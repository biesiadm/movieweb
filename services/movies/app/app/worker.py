import time
from collections import Generator

from app import schemas, crud
from app.db.session import SessionLocal
from app.core.celery_app import celery_app


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


@celery_app.task(acks_late=True, bind=True, task_track_started=True)
def test_celery(self, word: str) -> str:
    time.sleep(20)
    return f"test task return {word}"


@celery_app.task(acks_late=True, bind=True, task_track_started=True)
def add_movie(self, movie_in: schemas.MovieCreate):
    time.sleep(20)
    movie = crud.movie.create(db=get_db(), obj_in=movie_in)

    return movie.id
