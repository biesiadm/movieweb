from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_MOVIES: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    POOL_SIZE: int
    POOL_MAX_OVERFLOW: int
    POOL_TIMEOUT: int

    class Config:
        case_sensitive = True


settings = Settings()
