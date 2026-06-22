from sqlalchemy import Column, String, Text, Boolean, BigInteger, DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.sql import func
from .database import Base


class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(String, primary_key=True, index=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    status = Column(String, nullable=False, default="em-andamento")
    header = Column(JSONB, nullable=False)
    analysis_request = Column(JSONB, nullable=False)
    operating_conditions = Column(JSONB, nullable=False)
    diagnostico = Column(JSONB, nullable=False)
    checklist_data = Column(JSONB, nullable=False)
    kanban = Column(JSONB, nullable=False)
    fotos = Column(JSONB, nullable=False)
    assinatura_tecnico = Column(String, nullable=True)
    
    # Compartilhamento e reciclagem
    shared_with = Column(ARRAY(String), nullable=False, default=[])  # lista de UIDs
    recycled_from = Column(String, nullable=True)  # ID da inspeção original
    recycled_by = Column(String, nullable=True)  # username de quem reciclou
    recycled_at = Column(BigInteger, nullable=True)  # epoch


class InspectionEdit(Base):
    __tablename__ = "inspection_edits"
    id = Column(String, primary_key=True, index=True)
    inspection_id = Column(String, nullable=False, index=True)
    edited_by = Column(String, nullable=False)  # username
    edited_at = Column(BigInteger, nullable=False)  # epoch unix
    field_changed = Column(String, nullable=False)  # "cliente", "diagnostico", etc
    old_value = Column(Text, nullable=True)  # JSON string
    new_value = Column(Text, nullable=True)  # JSON string
    edit_reason = Column(String, nullable=True)  # motivo da edição


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # UID de quem recebe
    type = Column(String, nullable=False)  # "inspection_shared", "inspection_recycled", "inspection_edited"
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    related_inspection_id = Column(String, nullable=True)
    related_user = Column(String, nullable=True)  # quem compartilhou/reciclou
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(BigInteger, nullable=False)  # epoch


class User(Base):
    __tablename__ = "users"
    uid = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False, default="user")
    ativo = Column(Boolean, default=True, nullable=False)
    criado_em = Column(BigInteger, nullable=False)
    password_hash = Column(String, nullable=True)
    must_change_password = Column(Boolean, default=True, nullable=False)
    password_changed_at = Column(BigInteger, nullable=True)
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(BigInteger, nullable=True)


class Counter(Base):
    __tablename__ = "counters"
    name = Column(String, primary_key=True, index=True)
    last_value = Column(BigInteger, nullable=False, default=1000)