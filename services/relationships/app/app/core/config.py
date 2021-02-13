from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_RELATIONSHIPS: str
    API_USERS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    USERS_SERVICE_NAME: str

    POOL_SIZE: int
    POOL_MAX_OVERFLOW: int
    POOL_TIMEOUT: int

    class Config:
        case_sensitive = True


settings = Settings()
