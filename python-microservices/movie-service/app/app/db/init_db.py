from sqlalchemy.orm import Session

from app import crud
from app.db.initial_data import movies


def add_movies(db: Session) -> None:
    for movie_in in movies:
        movie = crud.movie.get_by_title(db=db, title=movie_in.title)

        if not movie:
            movie = crud.movie.create(db, obj_in=movie_in)  # noqa: F841


def init_db(db: Session) -> None:
    add_movies(db)
