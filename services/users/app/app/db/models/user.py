import uuid
from sqlalchemy import Column, String, Boolean

from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import UUID


class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    login = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
