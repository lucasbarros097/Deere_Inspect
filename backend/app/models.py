from sqlalchemy import Column, String, Text, Boolean, BigInteger, DateTime
from sqlalchemy.dialects.postgresql import JSONB
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


class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False, default="user")
    ativo = Column(Boolean, default=True, nullable=False)
    criado_em = Column(BigInteger, nullable=False)
    password_hash = Column(String, nullable=True)


class Counter(Base):
    __tablename__ = "counters"

    name = Column(String, primary_key=True, index=True)
    last_value = Column(BigInteger, nullable=False, default=1000)
