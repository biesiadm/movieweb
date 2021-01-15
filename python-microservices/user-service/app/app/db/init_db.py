from sqlalchemy.orm import Session


def add_users(db: Session) -> None:
    pass


def init_db(db: Session) -> None:
    add_users(db)
