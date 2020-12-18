from typing import List

from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.movie import Movie
from app.schemas.movie import MovieCreate, MovieUpdate


class CRUDMovie(CRUDBase[Movie, MovieCreate, MovieUpdate]):
    def get_by_title(self, db: Session, *, title: str) -> List[Movie]:
        return db.query(Movie).filter(Movie.title == title).all()

    def get_by_director(self, db: Session, *, director: str) -> List[Movie]:
        return db.query(Movie).filter(Movie.director == director).all()

    def get_by_category(self, db: Session, *, category: str) -> List[Movie]:
        return db.query(Movie).filter(Movie.category == category).all()

    def get_by_country(self, db: Session, *, country: str) -> List[Movie]:
        return db.query(Movie).filter(Movie.country == country).all()


movie = CRUDMovie(Movie)
