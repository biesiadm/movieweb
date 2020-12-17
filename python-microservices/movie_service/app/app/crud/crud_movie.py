# from sqlalchemy.orm import Session
# from app.crud.base import CRUDBase
# from app.db.models.movie import Movie
# from app.schema.movie import MovieCreate, MovieUpdate
#
#
# class CRUDMovie(CRUDBase[Movie, MovieCreate, MovieUpdate]):
#     def create(self, db: Session, *, obj_in: MovieCreate) -> Movie:
#         db_obj = Movie(
#             title=obj_in.title
#
#         )
