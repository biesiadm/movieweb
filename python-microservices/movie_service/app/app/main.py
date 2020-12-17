import logging
from typing import Optional, Generator

from fastapi import FastAPI, Depends
from app.db.session import SessionLocal
from app import crud, schemas
from sqlalchemy.orm import Session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/movie/{movie_id}")
def get_movie(movie_id: int, q: Optional[str]):
    try:
        db: Session = SessionLocal()
        movie = crud.movie.get(db=db, id=movie_id)

        print(movie.title, movie.id)
        print(id, q)

        if movie:
            return movie
        else:
            return {"Works?": "Doesn't work"}
    except Exception as e:
        logger.error(e)
        return


@app.post("/movie/create")
def create_movie(movie_in: schemas.MovieCreate):
    try:
        db: Session = SessionLocal()
        movie = crud.movie.create(db=db, obj_in=movie_in)

        return movie
    except Exception as e:
        logger.error(e)
        return
