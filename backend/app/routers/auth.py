import time
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from .. import auth, crud, models, schemas
from ..database import SessionLocal

router = APIRouter(tags=["auth"])

async def get_db():
    async with SessionLocal() as db:
        yield db

@router.post("/login", response_model=schemas.Token)
async def login(request: Request, response: Response, login_req: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    username = login_req.username.strip().lower()[:64]
    user = await crud.get_user_by_username(db, username=username)

    INVALID_MSG = "Nome de usuário ou senha incorretos"

    if not user:
        raise HTTPException(status_code=401, detail=INVALID_MSG)

    if user.locked_until and int(time.time()) < user.locked_until:
        minutos = max(1, (user.locked_until - int(time.time())) // 60)
        raise HTTPException(
            status_code=429,
            detail=f"Conta bloqueada por tentativas excessivas. Tente novamente em {minutos} minuto(s)."
        )

    if not user.ativo:
        raise HTTPException(status_code=401, detail=INVALID_MSG)

    if not auth.verify_password(login_req.password, user.password_hash):
        await crud.record_failed_login(db, user)
        await db.refresh(user)
        remaining = max(0, 5 - (user.failed_attempts or 0))
        if remaining == 0:
            raise HTTPException(status_code=429, detail="Conta bloqueada por 15 minutos devido a tentativas excessivas.")
        raise HTTPException(status_code=401, detail=INVALID_MSG)

    await crud.record_successful_login(db, user)
    await db.refresh(user)

    PASSWORD_EXPIRY_DAYS = 90
    password_expired = False
    if user.password_changed_at:
        days_since_change = (int(time.time()) - user.password_changed_at) / 86400
        if days_since_change > PASSWORD_EXPIRY_DAYS:
            password_expired = True

    must_change = False
    if user.role != "admin":
        must_change = user.must_change_password or password_expired

    access_token = auth.create_access_token(data={
        "sub": user.username,
        "role": user.role,
        "must_change_password": must_change,
    })

    # DevSecOps: HTTPOnly Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=False, # set true in prod with https
        samesite="lax",
        max_age=86400
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": must_change,
        "username": user.username,
    }

@router.get("/me")
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "uid": current_user.uid,
        "username": current_user.username,
        "role": current_user.role,
        "must_change_password": current_user.must_change_password,
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"detail": "Logged out"}

@router.post("/change-password")
async def change_password(
    req: schemas.ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # we have to merge async but it's safe to use current_user usually. Let's merge via await db.merge()
    user = await db.merge(current_user)

    if not auth.verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Senha atual incorreta")

    if auth.verify_password(req.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="A nova senha não pode ser igual à senha atual")

    # validate strength here
    from ..main import validate_password_strength # will refactor this out
    error = validate_password_strength(req.new_password)
    if error:
        raise HTTPException(status_code=400, detail=error)

    new_hash = auth.get_password_hash(req.new_password)
    await crud.change_password(db, user, new_hash)

    return {"detail": "Senha alterada com sucesso"}
