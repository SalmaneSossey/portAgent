"""
Submit Router - Simulated submission to PortNet
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid
import random

from database import get_db
from models import Dossier, DossierStatus, PipelineEvent, PipelineStatus

router = APIRouter()


class SubmitRequest(BaseModel):
    dossier_id: str


class SubmitResponse(BaseModel):
    submitted: bool
    reference: str
    message: str


@router.post("/submit", response_model=SubmitResponse)
async def submit_dossier(
    request: SubmitRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Simulate submission to PortNet.
    Generates a reference number and updates status.
    """
    try:
        dossier_uuid = uuid.UUID(request.dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    dossier = db.query(Dossier).filter(Dossier.id == dossier_uuid).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    # Generate PortNet reference
    year = datetime.now().year
    number = random.randint(10000, 99999)
    reference = f"PN-{year}-{number}"
    
    # Update dossier
    dossier.status = DossierStatus.SOUMIS
    dossier.reference = reference
    dossier.updated_at = datetime.utcnow()
    
    # Create pipeline event
    event = PipelineEvent(
        dossier_id=dossier_uuid,
        agent="Soumission",
        step="submit",
        status=PipelineStatus.SUCCESS,
        duration_ms=150,
        message_readable=f"Dossier soumis avec succès. Référence: {reference}"
    )
    db.add(event)
    db.commit()
    
    return SubmitResponse(
        submitted=True,
        reference=reference,
        message=f"Votre dossier a été soumis avec succès sur PortNet. Référence: {reference}"
    )
