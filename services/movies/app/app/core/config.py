from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    API_MOVIES: str
    SERVICE_NAME: str

    DATABASE_URL: AnyUrl

    class Config:
        case_sensitive = True


settings = Settings()
