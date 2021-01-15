from app import crud
from sqlalchemy.orm import Session
from app.db.initial_data import users


def add_users(db: Session) -> None:
    for user_in in users:
        user = crud.user.get_by_email(db=db, email=user_in.email)

        if not user:
            user = crud.user.create(db=db, obj_in=user_in)


def init_db(db: Session) -> None:
    add_users(db)
