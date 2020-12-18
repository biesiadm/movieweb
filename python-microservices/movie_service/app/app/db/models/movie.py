from sqlalchemy import Column, Integer, String

from app.db.base_class import Base


class Movie(Base):
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, index=True, nullable=False)
    director = Column(String, index=True, nullable=False)
    year = Column(Integer, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    budget = Column(Integer)
    box_office = Column(Integer)
    category = Column(String, index=True, nullable=False)
    original_language = Column(String, index=True)
