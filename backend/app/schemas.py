from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class InspectionBase(BaseModel):
    created_by: str = ""
    header: Dict[str, Any] = Field(default_factory=dict)
    analysis_request: Dict[str, Any] = Field(default_factory=dict)
    operating_conditions: Dict[str, Any] = Field(default_factory=dict)
    diagnostico: Dict[str, Any] = Field(default_factory=dict)
    checklist_data: Dict[str, List[Dict[str, Any]]] = Field(default_factory=dict)
    kanban: List[Dict[str, Any]] = Field(default_factory=list)
    fotos: List[Dict[str, Any]] = Field(default_factory=list)
    assinatura_tecnico: Optional[str] = ""
    status: str = "em-andamento"
    shared_with: List[str] = Field(default_factory=list)
    recycled_from: Optional[str] = None
    recycled_by: Optional[str] = None


class InspectionCreate(InspectionBase):
    id: str


class InspectionUpdate(BaseModel):
    header: Optional[Dict[str, Any]] = None
    analysis_request: Optional[Dict[str, Any]] = None
    operating_conditions: Optional[Dict[str, Any]] = None
    diagnostico: Optional[Dict[str, Any]] = None
    checklist_data: Optional[Dict[str, List[Dict[str, Any]]]] = None
    kanban: Optional[List[Dict[str, Any]]] = None
    fotos: Optional[List[Dict[str, Any]]] = None
    assinatura_tecnico: Optional[str] = None
    status: Optional[str] = None
    edit_reason: Optional[str] = None  # Motivo da edição


class InspectionResponse(InspectionCreate, InspectionBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InspectionEditLog(BaseModel):
    id: str
    edited_by: str
    edited_at: int
    field_changed: str
    old_value: Optional[str]
    new_value: Optional[str]
    edit_reason: Optional[str]


class ShareInspectionRequest(BaseModel):
    shared_with_uids: List[str]  # UIDs dos técnicos


class RecycleInspectionRequest(BaseModel):
    fields_to_keep: List[str]  # ["header", "fotos", "diagnostico"]


class UserBase(BaseModel):
    username: str
    role: str = "user"
    ativo: bool = True


class UserCreate(UserBase):
    uid: str
    password: str


class UserUpdate(BaseModel):
    role: Optional[str] = None
    ativo: Optional[bool] = None


class UserResponse(BaseModel):
    uid: str
    username: str
    role: str
    ativo: bool
    criado_em: int
    must_change_password: bool = True

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    related_inspection_id: Optional[str]
    related_user: Optional[str]
    read: bool
    created_at: int


class NextRastreabilidadeResponse(BaseModel):
    next_rastreabilidade: int


class Token(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool = False
    username: str = ""


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str