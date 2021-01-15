from app.crud.base import CRUDBase
from app.db.models import User
from app.schemas import UserCreate, UserUpdate
from sqlalchemy.orm import Session
from app.core.security import get_password_hash


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> User:
        return db.query(self.model).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            password_hash=get_password_hash(obj_in.email + obj_in.password),
            name=obj_in.name
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


user = CRUDUser(User)
