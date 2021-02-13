from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=settings.POOL_SIZE,
                       max_overflow=settings.POOL_MAX_OVERFLOW, pool_timeout=settings.POOL_TIMEOUT)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
