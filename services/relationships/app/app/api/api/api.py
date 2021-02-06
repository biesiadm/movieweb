from fastapi import APIRouter

from app.api.api.endpoints import relationships

api_router = APIRouter()
api_router.include_router(relationships.router, tags=["relationships"])
