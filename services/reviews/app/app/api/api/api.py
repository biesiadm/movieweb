from fastapi import APIRouter

from app.api.api.endpoints import reviews

api_router = APIRouter()
api_router.include_router(reviews.router, tags=["reviews"])
