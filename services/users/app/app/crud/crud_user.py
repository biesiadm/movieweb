from typing import Optional, List
from uuid import UUID

from app.crud.base import CRUDBase
from app.db.models import User
from app.schemas import UserCreate, UserUpdate
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> User:
        return db.query(self.model).filter(User.email == email).first()

    def get_by_login(self, db: Session, *, login: str) -> User:
        return db.query(self.model).filter(User.login == login).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            password_hash=get_password_hash(obj_in.email + obj_in.password),
            name=obj_in.name,
            login=obj_in.login,
            avatar_url=obj_in.avatar_url,
            is_active=obj_in.is_active,
            is_superuser=obj_in.is_superuser
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(user.email + password, user.password_hash):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

    def get_multi_filter(self, db: Session, *, skip: int, limit: int, user_id: Optional[List[UUID]] = None):
        if user_id:
            return db.query(self.model).filter(User.id.in_(user_id)) \
                .offset(skip).limit(limit).all()
        else:
            return db.query(self.model).offset(skip).limit(limit).all()
        
    def count(self, db: Session) -> int:
        return db.query(func.count(User.id)).first()[0]


user = CRUDUser(User)
