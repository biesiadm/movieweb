from typing import List, Any
from uuid import UUID

from app import schemas, crud
from app.api import deps
from app.db import models
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/following/{user_id}", response_model=List[schemas.Relationship])
def read_user_followers(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.relationship.get_user_followers(db, user_id=user_id, skip=skip, limit=limit)
    return reviews


@router.get("/followed-by/{user_id}", response_model=List[schemas.Relationship])
def read_following_by_user(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
) -> Any:
    """
    Retrieve reviews by movie.
    """
    reviews = crud.relationship.get_following_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return reviews


@router.post("/new", response_model=schemas.Relationship)
def add_relationship(
        db: Session = Depends(deps.get_db),
        *,
        relationship_in: schemas.RelationshipCreate
) -> Any:
    relationship = crud.relationship.get(db=db, obj_in=relationship_in)

    return relationship
