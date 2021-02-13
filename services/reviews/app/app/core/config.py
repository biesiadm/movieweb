from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_MOVIES: str
    API_USERS: str
    API_REVIEWS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    MOVIES_SERVICE_NAME: str
    USERS_SERVICE_NAME: str

    POOL_SIZE: int
    POOL_MAX_OVERFLOW: int
    POOL_TIMEOUT: int

    class Config:
        case_sensitive = True


settings = Settings()
