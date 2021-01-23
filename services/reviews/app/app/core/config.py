import secrets

from pydantic import BaseSettings, AnyUrl, EmailStr


class Settings(BaseSettings):
    API_USERS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    class Config:
        case_sensitive = True


settings = Settings()
