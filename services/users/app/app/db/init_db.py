from app import crud
from sqlalchemy.orm import Session
from app.db.initial_data import users


def add_users(db: Session) -> None:
    for user_in in users:
        user_e = crud.user.get_by_email(db=db, email=user_in.email)
        user_l = crud.user.get_by_login(db=db, login=user_in.login)

        if not user_e and not user_l:
            user = crud.user.create(db=db, obj_in=user_in)


def init_db(db: Session) -> None:
    add_users(db)
