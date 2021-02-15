import uuid
from sqlalchemy import Column, Integer, String

from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import UUID


class Movie(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, index=True, nullable=False)
    poster_url = Column(String)
    background_url = Column(String)
    director = Column(String, index=True, nullable=False)
    year = Column(Integer, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    slug = Column(String, index=True, nullable=False)
