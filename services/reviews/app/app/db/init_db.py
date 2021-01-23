from app import crud
from sqlalchemy.orm import Session
from app.db.initial_data import reviews


# def add_reviews(db: Session) -> None:
#     for review_in in reviews:
#         user_reviews = crud.review.get_by_user(db=db, user_name=review_in.user_name)
#
#         if not user_reviews:
#             review = crud.review.create(db=db, obj_in=review_in)


def init_db(db: Session) -> None:
    pass
