from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/deere_inspect"
    app_name: str = "Deere Inspect API"
    api_prefix: str = "/api"
    secret_key: str = "super_secret_key_change_in_production"
    access_token_expire_minutes: int = 10080  # 7 days

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
