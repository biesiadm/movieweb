from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_MOVIES: str
    API_USERS: str
    API_REVIEWS: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    MOVIES_SERVICE_NAME: str
    USERS_SERVICE_NAME: str

    class Config:
        case_sensitive = True


settings = Settings()
