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


@router.post("/follow", response_model=schemas.Relationship)
def add_relationship(
        db: Session = Depends(deps.get_db),
        *,
        relationship_in: schemas.RelationshipCreate
) -> Any:
    if relationship_in.user_id == relationship_in.followed_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='You cannot follow yourself.'
        )

    relationship = crud.relationship.get_relationship(db=db, user_id=relationship_in.user_id,
                                                      followed_user_id=relationship_in.followed_user_id)

    if relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Relationship already exists.'
        )

    relationship = crud.relationship.create(db=db, obj_in=relationship_in)

    return relationship


@router.delete("/unfollow", response_model=schemas.Relationship)
def delete_relationship(
        db: Session = Depends(deps.get_db),
        *,
        relationship_in: schemas.RelationshipCreate
) -> Any:
    relationship = crud.relationship.get_relationship(db=db, user_id=relationship_in.user_id,
                                                      followed_user_id=relationship_in.followed_user_id)

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'You are not following user {relationship_in.followed_user_id}.'
        )

    crud.relationship.remove(db=db, id=relationship.id)

    return relationship
