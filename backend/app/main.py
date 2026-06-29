import time
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from . import auth, crud, models, schemas
from .config import settings
from .database import SessionLocal, init_db

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)


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

api_router = APIRouter(prefix=settings.api_prefix, redirect_slashes=False)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ==================== AUTH ====================

@api_router.post("/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    username = login_req.username.strip().lower()[:64]
    user = crud.get_user_by_username(db, username=username)

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
        crud.record_failed_login(db, user)
        db.refresh(user)
        remaining = max(0, 5 - (user.failed_attempts or 0))
        if remaining == 0:
            raise HTTPException(status_code=429, detail="Conta bloqueada por 15 minutos devido a tentativas excessivas.")
        raise HTTPException(status_code=401, detail=INVALID_MSG)

    crud.record_successful_login(db, user)
    db.refresh(user)

    PASSWORD_EXPIRY_DAYS = 90
    password_expired = False
    if user.password_changed_at:
        days_since_change = (int(time.time()) - user.password_changed_at) / 86400
        if days_since_change > PASSWORD_EXPIRY_DAYS:
            password_expired = True

    # Only non-admin users (role "user") must change password
    must_change = False
    if user.role != "admin":
        must_change = user.must_change_password or password_expired

    access_token = auth.create_access_token(data={
        "sub": user.username,
        "role": user.role,
        "must_change_password": must_change,
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": must_change,
        "username": user.username,
    }


@api_router.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "uid": current_user.uid,
        "username": current_user.username,
        "role": current_user.role,
        "must_change_password": current_user.must_change_password,
    }


@api_router.post("/change-password")
def change_password(
    req: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    user = db.merge(current_user)

    if not auth.verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Senha atual incorreta")

    if auth.verify_password(req.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="A nova senha não pode ser igual à senha atual")

    error = validate_password_strength(req.new_password)
    if error:
        raise HTTPException(status_code=400, detail=error)

    new_hash = auth.get_password_hash(req.new_password)
    crud.change_password(db, user, new_hash)

    return {"detail": "Senha alterada com sucesso"}


# ==================== INSPECTIONS ====================

@api_router.get("/inspections", response_model=list[schemas.InspectionResponse])
def read_inspections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Retorna inspeções do usuário (criadas + compartilhadas)"""
    return crud.get_inspections_for_user(db, current_user.username)


@api_router.get("/inspections/{inspection_id}", response_model=schemas.InspectionResponse)
def read_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    inspection = crud.get_inspection(db, inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Verifica se o usuário tem acesso
    if inspection.created_by != current_user.username and current_user.username not in (inspection.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    return inspection


@api_router.post("/inspections", response_model=schemas.InspectionResponse)
def create_inspection(
    inspection: schemas.InspectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection.id)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Inspection already exists")
    
    inspection.created_by = current_user.username
    return crud.create_inspection(db, inspection)


@api_router.put("/inspections/{inspection_id}", response_model=schemas.InspectionResponse)
def update_inspection(
    inspection_id: str,
    inspection_update: schemas.InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Verifica permissão (criador ou compartilhado)
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    # Verifica se é finalizada e compartilhada (não pode editar)
    if existing.status == "finalizada" and existing.created_by != current_user.username:
        raise HTTPException(status_code=403, detail="Você não pode editar uma inspeção finalizada compartilhada")
    
    updated = crud.update_inspection(db, inspection_id, inspection_update, current_user.username)
    if updated is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return updated


@api_router.delete("/inspections/{inspection_id}")
def delete_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username:
        raise HTTPException(status_code=403, detail="Apenas o criador pode deletar")
    
    deleted = crud.delete_inspection(db, inspection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return {"detail": "Inspection deleted"}


# ==================== COMPARTILHAMENTO ====================

@api_router.post("/inspections/{inspection_id}/share")
def share_inspection(
    inspection_id: str,
    req: schemas.ShareInspectionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username:
        raise HTTPException(status_code=403, detail="Apenas o criador pode compartilhar")
    
    shared = crud.share_inspection(db, inspection_id, req.shared_with_uids)
    
    # Cria notificações para cada usuário
    for uid in req.shared_with_uids:
        crud.create_notification(
            db,
            uid,
            "inspection_shared",
            f"Inspeção compartilhada",
            f"{current_user.username} compartilhou uma inspeção com você",
            related_inspection_id=inspection_id,
            related_user=current_user.username
        )
    
    return {"detail": "Inspection shared", "shared_with": shared.shared_with}


# ==================== RECICLAGEM ====================

@api_router.post("/inspections/{inspection_id}/recycle")
def recycle_inspection(
    inspection_id: str,
    req: schemas.RecycleInspectionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Verifica se é o criador ou se foi compartilhada
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    recycled = crud.recycle_inspection(db, inspection_id, current_user.username, req.fields_to_keep)
    
    # Notifica o criador original se for reciclar uma compartilhada
    if existing.created_by != current_user.username:
        crud.create_notification(
            db,
            existing.created_by,
            "inspection_recycled",
            "Inspeção reciclada",
            f"{current_user.username} reciclou uma inspeção compartilhada com ele",
            related_inspection_id=recycled.id,
            related_user=current_user.username
        )
    
    return {"id": recycled.id, "detail": "Inspection recycled"}


# ==================== HISTÓRICO DE EDIÇÕES ====================

@api_router.get("/inspections/{inspection_id}/edits", response_model=list[schemas.InspectionEditLog])
def get_inspection_edits(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Verifica permissão
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    edits = crud.get_inspection_edits(db, inspection_id)
    return [
        schemas.InspectionEditLog(
            id=edit.id,
            edited_by=edit.edited_by,
            edited_at=edit.edited_at,
            field_changed=edit.field_changed,
            old_value=edit.old_value,
            new_value=edit.new_value,
            edit_reason=edit.edit_reason
        )
        for edit in edits
    ]


# ==================== NOTIFICAÇÕES ====================

@api_router.get("/notifications", response_model=list[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notifications = crud.get_notifications(db, current_user.uid)
    return [
        schemas.NotificationResponse(
            id=n.id,
            type=n.type,
            title=n.title,
            message=n.message,
            related_inspection_id=n.related_inspection_id,
            related_user=n.related_user,
            read=n.read,
            created_at=n.created_at
        )
        for n in notifications
    ]


@api_router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notification = db.get(models.Notification, notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.uid:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    crud.mark_notification_as_read(db, notification_id)
    return {"detail": "Notification marked as read"}


# ==================== RASTREABILIDADE ====================

@api_router.get("/next-rastreabilidade", response_model=schemas.NextRastreabilidadeResponse)
def next_rastreabilidade(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    count = crud.get_next_rastreabilidade(db)
    return {"next_rastreabilidade": count}


# ==================== ADMIN ====================

@api_router.get("/users", response_model=list[schemas.UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    return crud.get_users(db)


@api_router.post("/users", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Nome de usuário já está em uso")
    password_hash = auth.get_password_hash(user.password)
    return crud.create_user(db, user, password_hash)


@api_router.put("/users/{uid}", response_model=schemas.UserResponse)
def update_user(
    uid: str,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    updated = crud.update_user(db, uid, user_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

# ==================== INITIAL SETUP ==================

@api_router.get("/setup/needs", response_model=dict)
def needs_setup(db: Session = Depends(get_db)):
    """Return whether the application needs initial setup (no users exist)."""
    return {"needs_setup": not crud.has_any_user(db)}

@api_router.post("/setup/admin", response_model=schemas.UserResponse)
def create_initial_admin(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create the first admin user. This endpoint is only usable when no users exist.
    It does not require authentication.
    """
    if crud.has_any_user(db):
        raise HTTPException(status_code=400, detail="Setup already completed")
    # Force admin role regardless of payload
    user.role = "admin"
    password_hash = auth.get_password_hash(user.password)
    return crud.create_user(db, user, password_hash)


app.include_router(api_router)