from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import auth, crud, models, schemas
from ..database import SessionLocal

router = APIRouter(tags=["inspections"])

async def get_db():
    async with SessionLocal() as db:
        yield db

@router.get("/inspections", response_model=list[schemas.InspectionResponse])
async def read_inspections(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return await crud.get_inspections_for_user(db, current_user.username)

@router.get("/inspections/all", response_model=list[schemas.InspectionResponse])
async def read_all_inspections(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permissão negada")
    return await crud.get_all_inspections(db)

@router.get("/inspections/{inspection_id}", response_model=schemas.InspectionResponse)
async def read_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    inspection = await crud.get_inspection(db, inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if current_user.role != "admin" and inspection.created_by != current_user.username and current_user.username not in (inspection.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    return inspection

@router.post("/inspections", response_model=schemas.InspectionResponse)
async def create_inspection(
    inspection: schemas.InspectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = await crud.get_inspection(db, inspection.id)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Inspection already exists")
    
    inspection.created_by = current_user.username
    return await crud.create_inspection(db, inspection)

@router.put("/inspections/{inspection_id}", response_model=schemas.InspectionResponse)
async def update_inspection(
    inspection_id: str,
    inspection_update: schemas.InspectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = await crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    if existing.status == "finalizada" and existing.created_by != current_user.username:
        raise HTTPException(status_code=403, detail="Você não pode editar uma inspeção finalizada compartilhada")
    
    updated = await crud.update_inspection(db, inspection_id, inspection_update, current_user.username)
    if updated is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return updated

@router.delete("/inspections/{inspection_id}")
async def delete_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = await crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username:
        raise HTTPException(status_code=403, detail="Apenas o criador pode deletar")
    
    deleted = await crud.delete_inspection(db, inspection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return {"detail": "Inspection deleted"}

@router.post("/inspections/{inspection_id}/recycle")
async def recycle_inspection(
    inspection_id: str,
    req: schemas.RecycleInspectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = await crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    recycled = await crud.recycle_inspection(db, inspection_id, current_user.username, req.fields_to_keep)
    
    if existing.created_by != current_user.username:
        await crud.create_notification(
            db,
            existing.created_by,
            "inspection_recycled",
            "Inspeção reciclada",
            f"{current_user.username} reciclou uma inspeção compartilhada com ele",
            related_inspection_id=recycled.id,
            related_user=current_user.username
        )
    
    return {"id": recycled.id, "detail": "Inspection recycled"}

@router.get("/inspections/{inspection_id}/edits", response_model=list[schemas.InspectionEditLog])
async def get_inspection_edits(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = await crud.get_inspection(db, inspection_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if existing.created_by != current_user.username and current_user.username not in (existing.shared_with or []):
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    edits = await crud.get_inspection_edits(db, inspection_id)
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

@router.get("/next-rastreabilidade", response_model=schemas.NextRastreabilidadeResponse)
async def next_rastreabilidade(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    count = await crud.get_next_rastreabilidade(db)
    return {"next_rastreabilidade": count}
