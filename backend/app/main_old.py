from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import auth, crud, models, schemas
from .config import settings
from .database import SessionLocal, init_db


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    #allow_origins=settings.allow_origins,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(f"{settings.api_prefix}/login-debug")
async def login_debug(request: dict = None):
    """Debug endpoint to see what's being sent"""
    from fastapi import Request
    import json
    try:
        # This is a workaround - just return the body as-is
        return {"message": "Debug received"}
    except Exception as e:
        return {"error": str(e)}


@app.post(f"{settings.api_prefix}/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Login request received: {login_req}")
    print(f"DEBUG: Username: {login_req.username}, Password: {login_req.password}")
    user = crud.get_user_by_username(db, username=login_req.username)
    print(f"DEBUG: User found: {user}")
    if not user or not auth.verify_password(login_req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Nome de usuário ou senha incorretos")
    if not user.ativo:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get(f"{settings.api_prefix}/inspections", response_model=list[schemas.InspectionResponse])
def read_inspections(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_inspections(db)


@app.get(f"{settings.api_prefix}/inspections/{{inspection_id}}", response_model=schemas.InspectionResponse)
def read_inspection(inspection_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    inspection = crud.get_inspection(db, inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection


@app.post(f"{settings.api_prefix}/inspections", response_model=schemas.InspectionResponse)
def create_inspection(inspection: schemas.InspectionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = crud.get_inspection(db, inspection.id)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Inspection already exists")
    return crud.create_inspection(db, inspection)


@app.put(f"{settings.api_prefix}/inspections/{{inspection_id}}", response_model=schemas.InspectionResponse)
def update_inspection(inspection_id: str, inspection_update: schemas.InspectionUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    updated = crud.update_inspection(db, inspection_id, inspection_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return updated


@app.delete(f"{settings.api_prefix}/inspections/{{inspection_id}}")
def delete_inspection(inspection_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    deleted = crud.delete_inspection(db, inspection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return {"detail": "Inspection deleted"}


@app.get(f"{settings.api_prefix}/next-rastreabilidade", response_model=schemas.NextRastreabilidadeResponse)
def next_rastreabilidade(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    count = crud.get_next_rastreabilidade(db)
    return {"next_rastreabilidade": count}


@app.get(f"{settings.api_prefix}/users", response_model=list[schemas.UserResponse])
def read_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    return crud.get_users(db)


@app.post(f"{settings.api_prefix}/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Nome de usuário já está em uso")
    password_hash = auth.get_password_hash(user.password)
    return crud.create_user(db, user, password_hash)


@app.put(f"{settings.api_prefix}/users/{{uid}}", response_model=schemas.UserResponse)
def update_user(uid: str, user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    updated = crud.update_user(db, uid, user_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated
