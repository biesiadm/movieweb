from typing import List, Any
from uuid import UUID

from app import schemas, crud
from app.api import deps
from app.db import models
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()

# TODO(kantoniak) after fixing relations.ts change as previous ones
@router.get("/following/{user_id}",
            response_model=List[schemas.Relationship]
            # response_model=schemas.RelationshipsInfo
            )
def read_user_followers(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.SortingRelationships = Depends(deps.check_relationships_sorting)
) -> Any:
    """
    Retrieve users following user_id.
    """
    relationships = crud.relationship.get_user_followers(db=db, user_id=user_id, skip=skip, limit=limit,
                                                         sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)

    total_count = crud.relationship.count_user_followers(db=db, user_id=user_id)
    info = schemas.Info(count=len(relationships), totalCount=total_count)

    return relationships
    # return schemas.RelationshipsInfo(relationships=relationships, info=info)


# TODO(kantoniak) after fixing relations.ts change as previous ones
@router.get("/followed-by/{user_id}",
            response_model=List[schemas.Relationship]
            # response_model=schemas.RelationshipsInfo
            )
def read_following_by_user(
        user_id: UUID,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        sort_settings: schemas.SortingRelationships = Depends(deps.check_relationships_sorting)
) -> Any:
    """
    Retrieve following by user_id.
    """
    relationships = crud.relationship.get_following_by_user(db=db, user_id=user_id, skip=skip, limit=limit,
                                                            sort=sort_settings.sort, sort_dir=sort_settings.sort_dir)

    total_count = crud.relationship.count_following_by_user(db=db, user_id=user_id)
    info = schemas.Info(count=len(relationships), totalCount=total_count)

    return relationships
    # return schemas.RelationshipsInfo(relationships=relationships, info=info)


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
            status_code=status.HTTP_204_NO_CONTENT,
            detail='Relationship already exists.'
        )

    relationship = crud.relationship.create(db=db, obj_in=relationship_in)

    return relationship


@router.get("/users/{user_id}/followers/{followed_user_id}", response_model=bool)
def check_relationship(
        db: Session = Depends(deps.get_db),
        *,
        user_id: UUID,
        followed_user_id: UUID
) -> Any:
    relationship = relationship = crud.relationship.get_relationship(db=db, user_id=user_id,
                                                                     followed_user_id=followed_user_id)

    return relationship is not None


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
            status_code=status.HTTP_204_NO_CONTENT,
            detail=f'You are not following user {relationship_in.followed_user_id}.'
        )

    crud.relationship.remove(db=db, id=relationship.id)

    return relationship
