import uuid
from sqlalchemy import Column, String, Integer

from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import UUID


class Review(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    movie_id = Column(UUID(as_uuid=True))
    rating = Column(Integer, nullable=False)
    comment = Column(String)
