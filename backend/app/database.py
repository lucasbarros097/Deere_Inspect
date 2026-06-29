from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
import time

from .config import settings

engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def init_db() -> None:
    from . import models
    from sqlalchemy import text
    import uuid
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # Retry logic for database connection
    max_retries = 30
    retry_delay = 3
    
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"Database connection attempt {attempt + 1}/{max_retries} failed. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Failed to connect to database after {max_retries} attempts.")
                raise
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR NULL;"))
            conn.execute(text("UPDATE users SET username = email WHERE username IS NULL AND email IS NOT NULL;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users(username);") )
            conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS email;"))
            # Only create initial admin if the database is completely empty (no users at all)
            # This prevents re-creating admin on every container restart
            admin_username = settings.admin_username.strip().lower()
            if admin_username:
                user_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
                if user_count == 0:
                    conn.execute(
                        text(
                            "INSERT INTO users (uid, username, role, ativo, criado_em, password_hash) VALUES (:uid, :username, 'admin', true, :criado_em, :password_hash)"
                        ),
                        {
                            "uid": uuid.uuid4().hex,
                            "username": admin_username,
                            "criado_em": int(time.time()),
                            "password_hash": pwd_context.hash(settings.admin_password),
                        },
                    )
    except Exception:
        pass
