from typing import Generator, Optional

from fastapi import HTTPException, status

from app.schemas import SortingModel, SortingDir, SortingSettings
from app.db.session import SessionLocal


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def check_sorting(sort: Optional[str] = None, sort_dir: Optional[str] = None):
    try:
        if sort:
            SortingModel(sort)
            SortingDir(sort_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid sorting method, available are'
                   f' sort: {[e.value for e in SortingModel]} and'
                   f' sort_dir: {[e.value for e in SortingDir]}.'
        )

    return SortingSettings(sort=None, sort_dir=None) if sort is None else\
        SortingSettings(sort=SortingModel(sort), sort_dir=SortingDir(sort_dir))
