from typing import Optional, List

from pydantic import BaseModel, EmailStr
from uuid import UUID


class Info(BaseModel):
    count: int
    totalCount: int


class UserBase(BaseModel):
    email: EmailStr
    name: str
    login: str
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    pass


class User(UserBase):
    id: UUID

    class Config:
        orm_mode = True


class UserWeb(BaseModel):
    id: UUID
    name: str
    login: str
    avatar_url: str

    class Config:
        orm_mode = True


class UsersWebInfo(BaseModel):
    users: List[UserWeb]
    info: Info

    class Config:
        orm_mode = True
