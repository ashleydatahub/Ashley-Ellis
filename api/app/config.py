from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./micro_mentorship.db"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    cors_origin: str = "http://localhost:8080"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
