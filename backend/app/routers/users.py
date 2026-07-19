from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import auth, crud, models, schemas
from ..database import SessionLocal

router = APIRouter(tags=["users"])

async def get_db():
    async with SessionLocal() as db:
        yield db

@router.get("/users", response_model=list[schemas.UserResponse])
async def read_users(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    return await crud.get_users(db)

@router.post("/users", response_model=schemas.UserResponse)
async def create_user(
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    user.username = user.username.strip().lower()
    existing = await crud.get_user_by_username(db, username=user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Nome de usuário já está em uso")
    password_hash = auth.get_password_hash(user.password)
    return await crud.create_user(db, user, password_hash)

@router.put("/users/{uid}", response_model=schemas.UserResponse)
async def update_user(
    uid: str,
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    updated = await crud.update_user(db, uid, user_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.get("/setup/needs", response_model=dict)
async def needs_setup(db: AsyncSession = Depends(get_db)):
    return {"needs_setup": not await crud.has_any_user(db)}

@router.post("/setup/admin", response_model=schemas.UserResponse)
async def create_initial_admin(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    if await crud.has_any_user(db):
        raise HTTPException(status_code=400, detail="Setup already completed")
    user.username = user.username.strip().lower()
    user.role = "admin"
    password_hash = auth.get_password_hash(user.password)
    return await crud.create_user(db, user, password_hash)
