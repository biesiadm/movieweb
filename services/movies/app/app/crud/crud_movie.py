from typing import List

from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.movie import Movie
from app.schemas import MovieCreate, MovieUpdate, SortingDir, MoviesSortingModel


def determine_movies_sorting_type(sort: MoviesSortingModel, sort_dir: SortingDir):
    sorting_method = None

    if sort == MoviesSortingModel.year:
        sorting_method = Movie.year.desc() if sort_dir == SortingDir.desc else Movie.year.asc()
    elif sort == MoviesSortingModel.title:
        sorting_method = Movie.title.desc() if sort_dir == SortingDir.desc else Movie.title.asc()
    elif sort == MoviesSortingModel.country:
        sorting_method = Movie.country.desc() if sort_dir == SortingDir.desc else Movie.country.asc()
    elif sort == MoviesSortingModel.director:
        sorting_method = Movie.director.desc() if sort_dir == SortingDir.desc else Movie.director.asc()
    elif sort == MoviesSortingModel.category:
        sorting_method = Movie.category.desc() if sort_dir == SortingDir.desc else Movie.category.asc()

    return sorting_method


class CRUDMovie(CRUDBase[Movie, MovieCreate, MovieUpdate]):
    def get_by_title(self, db: Session, *, title: str) -> List[Movie]:
        return db.query(self.model).filter(Movie.title == title).all()

    def get_by_director(self, db: Session, *, director: str) -> List[Movie]:
        return db.query(self.model).filter(Movie.director == director).all()

    def get_by_category(self, db: Session, *, category: str) -> List[Movie]:
        return db.query(self.model).filter(Movie.category == category).all()

    def get_by_country(self, db: Session, *, country: str) -> List[Movie]:
        return db.query(self.model).filter(Movie.country == country).all()

    def get_multi_sort(self, db: Session, *, skip: int = 0, limit: int = 100,
                       sort: MoviesSortingModel, sort_dir: SortingDir):
        return db.query(self.model).order_by(determine_movies_sorting_type(sort, sort_dir)) \
            .offset(skip).limit(limit).all()


movie = CRUDMovie(Movie)
