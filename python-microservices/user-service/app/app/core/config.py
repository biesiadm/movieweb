import secrets

from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_USERS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 1 day = 1 day
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 1

    class Config:
        case_sensitive = True


settings = Settings()