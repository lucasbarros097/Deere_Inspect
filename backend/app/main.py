import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .database import init_db
from .routers import auth, inspections, users, notifications, chat

PASSWORD_REGEX = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,}$'
)

def validate_password_strength(password: str) -> str | None:
    if len(password) < 8:
        return "A senha deve ter no mínimo 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return "A senha deve conter pelo menos uma letra maiúscula"
    if not re.search(r'[a-z]', password):
        return "A senha deve conter pelo menos uma letra minúscula"
    if not re.search(r'\d', password):
        return "A senha deve conter pelo menos um número"
    if not re.search(r'[!@#$%^&*()\-_=+\[\]{};:\'",.<>/?\\|`~]', password):
        return "A senha deve conter pelo menos um caractere especial (!@#$%...)"
    return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(inspections.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(notifications.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)

@app.get("/health")
def health_check():
    return {"status": "ok"}