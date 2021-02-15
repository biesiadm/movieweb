from typing import Generator, Optional

from fastapi import HTTPException, status
from app.db.session import SessionLocal
from app.schemas import SortingDir, RelationshipsSortingModel, SortingRelationships


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def check_relationships_sorting(sort: Optional[str] = None, sort_dir: Optional[str] = None):
    try:
        if sort:
            RelationshipsSortingModel(sort)
            SortingDir(sort_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid sorting method, available are'
                   f' sort: {[e.value for e in RelationshipsSortingModel]} and'
                   f' sort_dir: {[e.value for e in SortingDir]}.'
        )

    return SortingRelationships(sort=None, sort_dir=None) if sort is None else\
        SortingRelationships(sort=RelationshipsSortingModel(sort), sort_dir=SortingDir(sort_dir))
