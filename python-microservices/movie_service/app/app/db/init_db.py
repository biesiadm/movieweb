from sqlalchemy.orm import Session

from app import crud, schemas


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    movie = crud.movie.get(db, id=1)

    if not movie:
        movie_in = schemas.MovieCreate(
            title='TEST',
            director='TEST_DIR',
            year=1234,
            country='TEST_POLAND',
            budget=2137,
            box_office=42069,
            category='TEST_CAT'
        )

        movie = crud.movie.create(db, obj_in=movie_in)  # noqa: F841
