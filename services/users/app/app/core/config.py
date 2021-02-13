import secrets

from pydantic import BaseSettings, AnyUrl, EmailStr


class Settings(BaseSettings):
    API_USERS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    SECRET_KEY: str
    # 60 minutes * 24 hours * 7 days = 7 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    ADMIN_EMAIL: EmailStr
    ADMIN_PASSWORD: str
    ADMIN_NAME: str

    POOL_SIZE: int
    POOL_MAX_OVERFLOW: int
    POOL_TIMEOUT: int

    class Config:
        case_sensitive = True


settings = Settings()
