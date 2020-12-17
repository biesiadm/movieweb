from .base import CRUDBase
from app.db.models.movie import Movie
from app.schemas.movie import MovieCreate, MovieUpdate

movie = CRUDBase[Movie, MovieCreate, MovieUpdate](Movie)
