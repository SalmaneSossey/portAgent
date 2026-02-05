"""
PortAgent Database Models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import enum

class DossierType(str, enum.Enum):
    EI = "EI"  # Engagement d'Importation
    LI = "LI"  # Licence d'Importation

class DossierStatus(str, enum.Enum):
    BROUILLON = "brouillon"
    EN_COURS = "en_cours"
    VALIDE = "valide"
    SOUMIS = "soumis"
    REJETE = "rejete"

class PipelineStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"

# ============================================
# DOSSIER (Main Import File)
# ============================================
class Dossier(Base):
    __tablename__ = "dossiers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type_ti = Column(SQLEnum(DossierType), default=DossierType.EI)
    status = Column(SQLEnum(DossierStatus), default=DossierStatus.BROUILLON)
    reference = Column(String(50), nullable=True)  # PN-YYYY-XXXXX after submission
    
    # Informations générales
    importateur = Column(String(255), default="SARL IMPORT EXPORT")
    raison_sociale = Column(String(255), nullable=True)
    
    # Summary for display
    summary_json_readable = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    provenances = relationship("Provenance", back_populates="dossier", cascade="all, delete-orphan")
    factures = relationship("Facture", back_populates="dossier", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="dossier", cascade="all, delete-orphan")
    marchandises = relationship("Marchandise", back_populates="dossier", cascade="all, delete-orphan")
    pipeline_events = relationship("PipelineEvent", back_populates="dossier", cascade="all, delete-orphan")

# ============================================
# PROVENANCE (Country of Origin)
# ============================================
class Provenance(Base):
    __tablename__ = "provenances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    pays = Column(String(100), nullable=False)
    code_pays = Column(String(3), nullable=True)  # ISO code
    
    dossier = relationship("Dossier", back_populates="provenances")

# ============================================
# FACTURE (Invoice)
# ============================================
class Facture(Base):
    __tablename__ = "factures"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    
    reference = Column(String(100), nullable=True)
    devise = Column(String(3), default="USD")
    montant = Column(Float, nullable=True)
    date_facture = Column(DateTime, nullable=True)
    fournisseur = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    
    # Extracted data
    extracted_data = Column(Text, nullable=True)  # JSON string
    
    dossier = relationship("Dossier", back_populates="factures")

# ============================================
# DOCUMENT (Attachments)
# ============================================
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    
    type_doc = Column(String(100), nullable=True)  # e.g., "Certificat d'origine"
    description = Column(Text, nullable=True)
    date_document = Column(DateTime, nullable=True)
    file_path = Column(String(500), nullable=True)
    
    dossier = relationship("Dossier", back_populates="documents")

# ============================================
# MARCHANDISE (Goods)
# ============================================
class Marchandise(Base):
    __tablename__ = "marchandises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    
    designation = Column(String(500), nullable=False)
    hs_code = Column(String(20), nullable=True)  # Code SH
    origine = Column(String(100), nullable=True)
    poids_net = Column(Float, nullable=True)
    unite = Column(String(20), default="KG")
    unite_complementaire = Column(String(50), nullable=True)
    quantite = Column(Float, nullable=True)
    valeur = Column(Float, nullable=True)
    
    dossier = relationship("Dossier", back_populates="marchandises")

# ============================================
# PIPELINE EVENT (Audit Log)
# ============================================
class PipelineEvent(Base):
    __tablename__ = "pipeline_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    
    ts = Column(DateTime, default=datetime.utcnow)
    agent = Column(String(50), nullable=False)  # e.g., "Orchestrateur", "TijarIA"
    step = Column(String(100), nullable=True)
    status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.PENDING)
    duration_ms = Column(Integer, nullable=True)
    message_readable = Column(Text, nullable=True)  # User-friendly message
    
    dossier = relationship("Dossier", back_populates="pipeline_events")
