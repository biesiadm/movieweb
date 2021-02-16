from typing import List, Any, Optional
from uuid import UUID

from app import schemas, crud
from app.api import deps
from app.db import models
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/",
            response_model=schemas.UsersWebInfo
            )
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[List[UUID]] = Query(None)
) -> Any:
    """
    Retrieve users.
    """
    users = crud.user.get_multi_filter(db, skip=skip, limit=limit, user_id=user_id)

    total_count = crud.user.count(db)
    info = schemas.Info(count=len(users), totalCount=total_count)

    return schemas.UsersWebInfo(users=users, info=info)


@router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.get("/{user_id}", response_model=schemas.UserWeb)
def read_user_by_id(
    user_id: UUID,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get(db=db, id=user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'User with id: {user_id} does not exist.'
        )

    return user


@router.get("/user/{user_login}", response_model=schemas.UserWeb)
def read_user_by_login(
        user_login: str,
        db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by login.
    """
    user = crud.user.get_by_login(db=db, login=user_login)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'User with login: {user_login} does not exist.'
        )

    return user
