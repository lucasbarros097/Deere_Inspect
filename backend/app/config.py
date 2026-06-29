from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Default to a local SQLite database for development/testing. Can be overridden via env var.
    database_url: str = "sqlite:///./test.db"
    app_name: str = "Deere Inspect API"
    api_prefix: str = "/api"
    secret_key: str = "super_secret_key_change_in_production"
    access_token_expire_minutes: int = 10080  # 7 days
    admin_username: str = "admin"
    admin_password: str = "admin123"

    allow_origins: List[str] = ["http://localhost:8080", "http://localhost:3000"]
    # Allow extra environment variables (e.g., those used by Docker compose) without validation errors
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "allow",
    }


settings = Settings()
