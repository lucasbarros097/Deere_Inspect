from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import auth, crud, models, schemas
from ..database import SessionLocal

router = APIRouter(tags=["notifications"])

async def get_db():
    async with SessionLocal() as db:
        yield db

@router.get("/notifications", response_model=list[schemas.NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notifications = await crud.get_notifications(db, current_user.uid)
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

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notification = await db.get(models.Notification, notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.uid:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    await crud.mark_notification_as_read(db, notification_id)
    return {"detail": "Notification marked as read"}
