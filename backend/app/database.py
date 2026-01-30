from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/flash"
    GOOGLE_API_KEY: str = ""
    QWEN_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    PREFERRED_PROVIDER: str = "gemini"  # or "qwen", "groq"

    JWT_SECRET: str = "supersecret"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    INTERNAL_AUTH_SECRET: str = "handshake-secret"  # Must match frontend
    ALLOWED_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
