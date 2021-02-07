import uuid
from sqlalchemy import Column, String, Integer, DateTime

from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import UUID


class Relationship(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    followed_user_id = Column(UUID(as_uuid=True), nullable=False)
    created = Column(DateTime, nullable=False)
