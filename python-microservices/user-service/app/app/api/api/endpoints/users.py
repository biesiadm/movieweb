from typing import List, Any
from uuid import UUID

from app import schemas, crud
from app.api import deps
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_movies(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
) -> Any:
    users = crud.user.get_multi(db, skip=skip, limit=limit)

    return users