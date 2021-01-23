import secrets

from pydantic import BaseSettings, AnyUrl, EmailStr


class Settings(BaseSettings):
    API_USERS: str
    API_REVIEWS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    SECRET_KEY: str

    class Config:
        case_sensitive = True


settings = Settings()
