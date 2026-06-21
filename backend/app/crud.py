from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from . import models, schemas


def get_inspection(db: Session, inspection_id: str) -> Optional[models.Inspection]:
    return db.get(models.Inspection, inspection_id)


def get_inspections(db: Session) -> list[models.Inspection]:
    return db.scalars(select(models.Inspection).order_by(models.Inspection.created_at.desc())).all()


def create_inspection(db: Session, inspection: schemas.InspectionCreate) -> models.Inspection:
    db_inspection = models.Inspection(**inspection.dict())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


def update_inspection(db: Session, inspection_id: str, updates: schemas.InspectionUpdate) -> Optional[models.Inspection]:
    db_inspection = get_inspection(db, inspection_id)
    if db_inspection is None:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_inspection, field, value)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


def delete_inspection(db: Session, inspection_id: str) -> bool:
    db_inspection = get_inspection(db, inspection_id)
    if db_inspection is None:
        return False
    db.delete(db_inspection)
    db.commit()
    return True


def get_next_rastreabilidade(db: Session) -> int:
    counter = db.get(models.Counter, "rastreabilidade")
    if counter is None:
        counter = models.Counter(name="rastreabilidade", last_value=1000)
        db.add(counter)
    else:
        counter.last_value += 1
    db.commit()
    db.refresh(counter)
    return int(counter.last_value)


def get_users(db: Session) -> list[models.User]:
    return db.scalars(select(models.User).order_by(models.User.criado_em.desc())).all()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.scalars(select(models.User).filter(models.User.email == email)).first()


def create_user(db: Session, user: schemas.UserCreate, password_hash: str) -> models.User:
    user_data = user.dict(exclude={"password"})
    db_user = models.User(**user_data, password_hash=password_hash)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, uid: str, updates: schemas.UserUpdate) -> Optional[models.User]:
    user = db.get(models.User, uid)
    if user is None:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
