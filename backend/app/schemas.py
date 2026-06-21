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


class InspectionCreate(InspectionBase):
    id: str


class InspectionUpdate(BaseModel):
    header: Optional[Dict[str, Any]]
    analysis_request: Optional[Dict[str, Any]]
    operating_conditions: Optional[Dict[str, Any]]
    diagnostico: Optional[Dict[str, Any]]
    checklist_data: Optional[Dict[str, List[Dict[str, Any]]]]
    kanban: Optional[List[Dict[str, Any]]]
    fotos: Optional[List[Dict[str, Any]]]
    assinatura_tecnico: Optional[str]
    status: Optional[str]


class InspectionResponse(InspectionCreate, InspectionBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    role: str = "user"
    ativo: bool = True


class UserCreate(UserBase):
    uid: str
    password: str


class UserUpdate(BaseModel):
    role: Optional[str]
    ativo: Optional[bool]


class UserResponse(BaseModel):
    uid: str
    username: str
    role: str
    ativo: bool
    criado_em: int

    class Config:
        orm_mode = True


class NextRastreabilidadeResponse(BaseModel):
    next_rastreabilidade: int


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
