from app.crud.base import CRUDBase
from app.db.models.user import User
from sqlalchemy.orm import Session


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> User:
        return db.query(self.model).filter(User.email == email).first()


user = CRUDUser(User)
