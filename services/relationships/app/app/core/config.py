import secrets

from pydantic import BaseSettings, AnyUrl, EmailStr


class Settings(BaseSettings):
    API_RELATIONSHIPS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    class Config:
        case_sensitive = True


settings = Settings()
