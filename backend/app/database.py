from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
import time

from .config import settings

# Modify the URL to use asyncpg
async_db_url = settings.database_url.replace("postgresql+psycopg2", "postgresql+asyncpg")

engine = create_async_engine(async_db_url, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, autoflush=False, autocommit=False, expire_on_commit=False, future=True)
Base = declarative_base()


async def init_db() -> None:
    from . import models
    from sqlalchemy import text
    import uuid
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    import asyncio
    # Retry logic for database connection
    max_retries = 30
    retry_delay = 3

    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Database connection attempt {attempt + 1}/{max_retries} failed. Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"Failed to connect to database after {max_retries} attempts.")
                raise

    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR NULL;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR NULL;"))
            await conn.execute(text("UPDATE users SET username = email WHERE username IS NULL AND email IS NOT NULL;"))
            await conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users(username);") )
            await conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS email;"))
            # Only create initial admin if the database is completely empty (no users at all)
            admin_username = settings.admin_username.strip().lower()
            if admin_username:
                result = await conn.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.scalar()
                if user_count == 0:
                    await conn.execute(
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
    except Exception as e:
        print(f"Error during init_db: {e}")
