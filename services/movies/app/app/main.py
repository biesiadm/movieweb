import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api.api import api_router

app = FastAPI(title=settings.SERVICE_NAME,
              openapi_url=f"{settings.API_MOVIES}/openapi.json")

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:" + os.environ['WEBAPP_PORT'],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_MOVIES)
