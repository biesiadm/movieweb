import os

from fastapi import FastAPI

from app.api.api.api import api_router

app = FastAPI(title=os.environ['SERVICE_NAME'])

app.include_router(api_router)
