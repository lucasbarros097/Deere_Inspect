import time
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models, schemas


# ==================== INSPECTIONS ====================

async def get_inspection(db: AsyncSession, inspection_id: str) -> Optional[models.Inspection]:
    return (await db.get(models.Inspection, inspection_id))


async def get_inspections(db: AsyncSession) -> list[models.Inspection]:
    result = await db.scalars(select(models.Inspection).order_by(models.Inspection.created_at.desc()))
    return result.all()


async def get_inspections_for_user(db: AsyncSession, username: str) -> list[models.Inspection]:
    """Retorna inspeções criadas pelo user + compartilhadas com ele"""
    result = await db.scalars(
        select(models.Inspection)
        .where(
            (models.Inspection.created_by == username) | 
            (models.Inspection.shared_with.contains([username]))
        )
        .order_by(models.Inspection.created_at.desc())
    )
    return result.all()


async def get_all_inspections(db: AsyncSession) -> list[models.Inspection]:
    """Retorna TODAS as inspeções (apenas para admin)"""
    result = await db.scalars(
        select(models.Inspection).order_by(models.Inspection.created_at.desc())
    )
    return result.all()


async def create_inspection(db: AsyncSession, inspection: schemas.InspectionCreate) -> models.Inspection:
    db_inspection = models.Inspection(**inspection.dict())
    db.add(db_inspection)
    await db.commit()
    await db.refresh(db_inspection)
    return db_inspection


async def update_inspection(db: AsyncSession, inspection_id: str, updates: schemas.InspectionUpdate, edited_by: str) -> Optional[models.Inspection]:
    db_inspection = await get_inspection(db, inspection_id)
    if db_inspection is None:
        return None
    
    # Log de edições
    for field, value in updates.dict(exclude_unset=True).items():
        if field != "edit_reason":  # edit_reason não é um campo da inspeção
            old_value = getattr(db_inspection, field, None)
            if old_value != value:
                await log_inspection_edit(
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
    await db.commit()
    await db.refresh(db_inspection)
    return db_inspection


async def delete_inspection(db: AsyncSession, inspection_id: str) -> bool:
    db_inspection = await get_inspection(db, inspection_id)
    if db_inspection is None:
        return False
    db.delete(db_inspection)
    await db.commit()
    return True


# ==================== COMPARTILHAMENTO ====================

async def share_inspection(db: AsyncSession, inspection_id: str, shared_with_uids: list[str]) -> Optional[models.Inspection]:
    """Compartilha uma inspeção com outros usuários"""
    inspection = await get_inspection(db, inspection_id)
    if inspection is None:
        return None
    
    # Remove duplicatas
    inspection.shared_with = list(set((inspection.shared_with or []) + shared_with_uids))
    await db.commit()
    await db.refresh(inspection)
    return inspection


# ==================== RECICLAGEM ====================

async def recycle_inspection(db: AsyncSession, original_id: str, new_owner_username: str, fields_to_keep: list[str]) -> Optional[models.Inspection]:
    """Recicla uma inspeção criando uma cópia com campos selecionados"""
    original = await get_inspection(db, original_id)
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
    await db.commit()
    await db.refresh(recycled)
    return recycled


# ==================== EDITS LOG ====================

async def log_inspection_edit(
    db: AsyncSession,
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
    await db.commit()
    return edit


async def get_inspection_edits(db: AsyncSession, inspection_id: str) -> list[models.InspectionEdit]:
    """Retorna histórico de edições de uma inspeção"""
    result = await db.scalars(
        select(models.InspectionEdit)
        .where(models.InspectionEdit.inspection_id == inspection_id)
        .order_by(models.InspectionEdit.edited_at.desc())
    )
    return result.all()


# ==================== NOTIFICATIONS ====================

async def create_notification(
    db: AsyncSession,
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
    await db.commit()
    return notification


async def get_notifications(db: AsyncSession, user_id: str, unread_only: bool = False) -> list[models.Notification]:
    """Retorna notificações do usuário"""
    query = select(models.Notification).where(models.Notification.user_id == user_id)
    
    if unread_only:
        query = query.where(models.Notification.read == False)
    
    result = await db.scalars(query.order_by(models.Notification.created_at.desc()))
    return result.all()


async def mark_notification_as_read(db: AsyncSession, notification_id: str) -> Optional[models.Notification]:
    """Marca notificação como lida"""
    notification = (await db.get(models.Notification, notification_id))
    if notification is None:
        return None
    notification.read = True
    await db.commit()
    await db.refresh(notification)
    return notification


# ==================== USERS ====================

async def get_next_rastreabilidade(db: AsyncSession) -> int:
    counter = (await db.get(models.Counter, "rastreabilidade"))
    if counter is None:
        counter = models.Counter(name="rastreabilidade", last_value=1000)
        db.add(counter)
    else:
        counter.last_value += 1
    await db.commit()
    await db.refresh(counter)
    return int(counter.last_value)


async def get_users(db: AsyncSession) -> list[models.User]:
    result = await db.scalars(select(models.User).order_by(models.User.criado_em.desc()))
    return result.all()

async def has_any_user(db: AsyncSession) -> bool:
    """Return True if there is at least one user in the database.
    This is used to determine if the initial admin setup is required.
    """
    result = await db.execute(select(models.User).limit(1))
    return result.first() is not None


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[models.User]:
    result = await db.scalars(select(models.User).filter(models.User.username == username))
    return result.first()


async def create_user(db: AsyncSession, user: schemas.UserCreate, password_hash: str) -> models.User:
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
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user(db: AsyncSession, uid: str, updates: schemas.UserUpdate) -> Optional[models.User]:
    user = (await db.get(models.User, uid))
    if user is None:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def record_failed_login(db: AsyncSession, user: models.User) -> None:
    user.failed_attempts = (user.failed_attempts or 0) + 1
    if user.failed_attempts >= 5:
        user.locked_until = int(time.time()) + 15 * 60
    await db.commit()


async def record_successful_login(db: AsyncSession, user: models.User) -> None:
    user.failed_attempts = 0
    user.locked_until = None
    await db.commit()


async def change_password(db: AsyncSession, user: models.User, new_password_hash: str) -> models.User:
    user.password_hash = new_password_hash
    user.must_change_password = False
    user.password_changed_at = int(time.time())
    user.failed_attempts = 0
    user.locked_until = None
    await db.commit()
    await db.refresh(user)
    return user