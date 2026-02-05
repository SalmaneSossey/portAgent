"""
Dossiers Router - CRUD operations for import dossiers
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_db
from models import Dossier, DossierType, DossierStatus, PipelineEvent

router = APIRouter()


class DossierCreate(BaseModel):
    type_ti: str = "EI"
    importateur: Optional[str] = "SARL IMPORT EXPORT"
    raison_sociale: Optional[str] = None


class DossierResponse(BaseModel):
    id: str
    type_ti: str
    status: str
    reference: Optional[str]
    importateur: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class PipelineEventResponse(BaseModel):
    id: str
    agent: str
    step: Optional[str]
    status: str
    duration_ms: Optional[int]
    message_readable: Optional[str]
    ts: datetime
    
    class Config:
        from_attributes = True


@router.post("/dossiers", response_model=DossierResponse)
async def create_dossier(data: DossierCreate, db: Session = Depends(get_db)):
    """Créer un nouveau dossier d'importation"""
    dossier = Dossier(
        type_ti=DossierType(data.type_ti) if data.type_ti in ["EI", "LI"] else DossierType.EI,
        importateur=data.importateur,
        raison_sociale=data.raison_sociale,
        status=DossierStatus.BROUILLON
    )
    db.add(dossier)
    db.commit()
    db.refresh(dossier)
    
    return DossierResponse(
        id=str(dossier.id),
        type_ti=dossier.type_ti.value,
        status=dossier.status.value,
        reference=dossier.reference,
        importateur=dossier.importateur or "",
        created_at=dossier.created_at
    )


@router.get("/dossiers/{dossier_id}", response_model=DossierResponse)
async def get_dossier(dossier_id: str, db: Session = Depends(get_db)):
    """Récupérer un dossier par son ID"""
    try:
        dossier_uuid = uuid.UUID(dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    dossier = db.query(Dossier).filter(Dossier.id == dossier_uuid).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    return DossierResponse(
        id=str(dossier.id),
        type_ti=dossier.type_ti.value,
        status=dossier.status.value,
        reference=dossier.reference,
        importateur=dossier.importateur or "",
        created_at=dossier.created_at
    )


@router.get("/dossiers/{dossier_id}/events", response_model=List[PipelineEventResponse])
async def get_dossier_events(dossier_id: str, db: Session = Depends(get_db)):
    """Récupérer les événements du pipeline pour un dossier"""
    try:
        dossier_uuid = uuid.UUID(dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    events = db.query(PipelineEvent).filter(
        PipelineEvent.dossier_id == dossier_uuid
    ).order_by(PipelineEvent.ts.asc()).all()
    
    return [
        PipelineEventResponse(
            id=str(e.id),
            agent=e.agent,
            step=e.step,
            status=e.status.value if e.status else "pending",
            duration_ms=e.duration_ms,
            message_readable=e.message_readable,
            ts=e.ts
        )
        for e in events
    ]
