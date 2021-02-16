import secrets

from pydantic import BaseSettings, AnyUrl, EmailStr


class Settings(BaseSettings):
    API_USERS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    SECRET_KEY: str
    # 60 minutes * 24 hours * 7 days = 7 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # pre-made users
    ADMIN_EMAIL: EmailStr
    ADMIN_PASSWORD: str
    ADMIN_NAME: str
    ADMIN_LOGIN: str

    USER1_EMAIL: EmailStr
    USER1_PASSWORD: str
    USER1_NAME: str
    USER1_LOGIN: str

    USER2_EMAIL: EmailStr
    USER2_PASSWORD: str
    USER2_NAME: str
    USER2_LOGIN: str

    POOL_SIZE: int
    POOL_MAX_OVERFLOW: int
    POOL_TIMEOUT: int

    NUMBER_OF_USERS: int

    class Config:
        case_sensitive = True


settings = Settings()
