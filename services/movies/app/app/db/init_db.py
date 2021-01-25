from sqlalchemy.orm import Session

from app import crud
from app.db.initial_data import movies
from app.db.models.movie import Movie

def init_movies(db: Session) -> None:
    db.query(Movie).delete()

    for movie in movies:
        crud.movie.create(db, obj_in=movie)  # noqa: F841


def init_db(db: Session) -> None:
    init_movies(db)
