import time
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from . import models, schemas


# ==================== INSPECTIONS ====================

def get_inspection(db: Session, inspection_id: str) -> Optional[models.Inspection]:
    return db.get(models.Inspection, inspection_id)


def get_inspections(db: Session) -> list[models.Inspection]:
    return db.scalars(select(models.Inspection).order_by(models.Inspection.created_at.desc())).all()


def get_inspections_for_user(db: Session, username: str) -> list[models.Inspection]:
    """Retorna inspeções criadas pelo user + compartilhadas com ele"""
    return db.scalars(
        select(models.Inspection)
        .where(
            (models.Inspection.created_by == username) | 
            (models.Inspection.shared_with.contains([username]))
        )
        .order_by(models.Inspection.created_at.desc())
    ).all()


def get_all_inspections(db: Session) -> list[models.Inspection]:
    """Retorna TODAS as inspeções (apenas para admin)"""
    return db.scalars(
        select(models.Inspection).order_by(models.Inspection.created_at.desc())
    ).all()


def create_inspection(db: Session, inspection: schemas.InspectionCreate) -> models.Inspection:
    db_inspection = models.Inspection(**inspection.dict())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


def update_inspection(db: Session, inspection_id: str, updates: schemas.InspectionUpdate, edited_by: str) -> Optional[models.Inspection]:
    db_inspection = get_inspection(db, inspection_id)
    if db_inspection is None:
        return None
    
    # Log de edições
    for field, value in updates.dict(exclude_unset=True).items():
        if field != "edit_reason":  # edit_reason não é um campo da inspeção
            old_value = getattr(db_inspection, field, None)
            if old_value != value:
                log_inspection_edit(
                    db,
                    inspection_id,
                    edited_by,
                    field,
                    str(old_value),
                    str(value),
                    updates.edit_reason
                )
            setattr(db_inspection, field, value)
    
    db_inspection.updated_at = __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
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


# ==================== COMPARTILHAMENTO ====================

def share_inspection(db: Session, inspection_id: str, shared_with_uids: list[str]) -> Optional[models.Inspection]:
    """Compartilha uma inspeção com outros usuários"""
    inspection = get_inspection(db, inspection_id)
    if inspection is None:
        return None
    
    # Remove duplicatas
    inspection.shared_with = list(set((inspection.shared_with or []) + shared_with_uids))
    db.commit()
    db.refresh(inspection)
    return inspection


# ==================== RECICLAGEM ====================

def recycle_inspection(db: Session, original_id: str, new_owner_username: str, fields_to_keep: list[str]) -> Optional[models.Inspection]:
    """Recicla uma inspeção criando uma cópia com campos selecionados"""
    original = get_inspection(db, original_id)
    if original is None:
        return None
    
    # Gera novo ID e rastreabilidade
    new_id = str(uuid.uuid4())
    
    # Cria inspeção reciclada
    recycled = models.Inspection(
        id=new_id,
        created_by=new_owner_username,
        created_at=__import__('datetime').datetime.now(__import__('datetime').timezone.utc),
        updated_at=__import__('datetime').datetime.now(__import__('datetime').timezone.utc),
        status="em-andamento",
        recycled_from=original_id,
        recycled_by=new_owner_username,
        recycled_at=int(time.time()),
    )
    
    # Copia campos selecionados
    if "header" in fields_to_keep and original.header:
        recycled.header = dict(original.header)
        recycled.header["rastreabilidade"] = 0  # Reset para gerar novo
    else:
        recycled.header = {}
    
    if "analysis_request" in fields_to_keep:
        recycled.analysis_request = original.analysis_request or {}
    
    if "operating_conditions" in fields_to_keep:
        recycled.operating_conditions = original.operating_conditions or {}
    
    if "diagnostico" in fields_to_keep:
        recycled.diagnostico = original.diagnostico or {}
    
    if "checklist_data" in fields_to_keep:
        recycled.checklist_data = original.checklist_data or {}
    
    if "kanban" in fields_to_keep:
        recycled.kanban = original.kanban or []
    
    if "fotos" in fields_to_keep:
        recycled.fotos = original.fotos or []
    
    recycled.assinatura_tecnico = ""
    recycled.shared_with = []
    
    db.add(recycled)
    db.commit()
    db.refresh(recycled)
    return recycled


# ==================== EDITS LOG ====================

def log_inspection_edit(
    db: Session,
    inspection_id: str,
    edited_by: str,
    field_changed: str,
    old_value: Optional[str],
    new_value: Optional[str],
    edit_reason: Optional[str] = None,
) -> models.InspectionEdit:
    """Registra edição de inspeção"""
    edit = models.InspectionEdit(
        id=str(uuid.uuid4()),
        inspection_id=inspection_id,
        edited_by=edited_by,
        edited_at=int(time.time()),
        field_changed=field_changed,
        old_value=old_value,
        new_value=new_value,
        edit_reason=edit_reason,
    )
    db.add(edit)
    db.commit()
    return edit


def get_inspection_edits(db: Session, inspection_id: str) -> list[models.InspectionEdit]:
    """Retorna histórico de edições de uma inspeção"""
    return db.scalars(
        select(models.InspectionEdit)
        .where(models.InspectionEdit.inspection_id == inspection_id)
        .order_by(models.InspectionEdit.edited_at.desc())
    ).all()


# ==================== NOTIFICATIONS ====================

def create_notification(
    db: Session,
    user_id: str,
    noti_type: str,
    title: str,
    message: str,
    related_inspection_id: Optional[str] = None,
    related_user: Optional[str] = None,
) -> models.Notification:
    """Cria uma notificação"""
    notification = models.Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=noti_type,
        title=title,
        message=message,
        related_inspection_id=related_inspection_id,
        related_user=related_user,
        read=False,
        created_at=int(time.time()),
    )
    db.add(notification)
    db.commit()
    return notification


def get_notifications(db: Session, user_id: str, unread_only: bool = False) -> list[models.Notification]:
    """Retorna notificações do usuário"""
    query = select(models.Notification).where(models.Notification.user_id == user_id)
    
    if unread_only:
        query = query.where(models.Notification.read == False)
    
    return db.scalars(query.order_by(models.Notification.created_at.desc())).all()


def mark_notification_as_read(db: Session, notification_id: str) -> Optional[models.Notification]:
    """Marca notificação como lida"""
    notification = db.get(models.Notification, notification_id)
    if notification is None:
        return None
    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification


# ==================== USERS ====================

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

def has_any_user(db: Session) -> bool:
    """Return True if there is at least one user in the database.
    This is used to determine if the initial admin setup is required.
    """
    return db.query(models.User).first() is not None


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.scalars(select(models.User).filter(models.User.username == username)).first()


def create_user(db: Session, user: schemas.UserCreate, password_hash: str) -> models.User:
    user_data = user.dict(exclude={"password"})
    db_user = models.User(
        uid=user_data["uid"],
        username=user_data["username"],
        role=user_data["role"],
        ativo=user_data["ativo"],
        criado_em=int(time.time()),
        password_hash=password_hash,
        must_change_password=True,
        password_changed_at=None,
        failed_attempts=0,
        locked_until=None,
    )
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


def record_failed_login(db: Session, user: models.User) -> None:
    user.failed_attempts = (user.failed_attempts or 0) + 1
    if user.failed_attempts >= 5:
        user.locked_until = int(time.time()) + 15 * 60
    db.commit()


def record_successful_login(db: Session, user: models.User) -> None:
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()


def change_password(db: Session, user: models.User, new_password_hash: str) -> models.User:
    user.password_hash = new_password_hash
    user.must_change_password = False
    user.password_changed_at = int(time.time())
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()
    db.refresh(user)
    return user