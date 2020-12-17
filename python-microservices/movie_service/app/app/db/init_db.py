from sqlalchemy.orm import Session

from app import crud, schemas
from app.db import base


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # Base.metadata.create_all(bind=engine)

    movie = crud.movie.get(db, id=1)
    if not movie:
        movie_in = schemas.MovieCreate(
            title='TEST'
        )
        movie = crud.movie.create(db, obj_in=movie_in)  # noqa: F841
