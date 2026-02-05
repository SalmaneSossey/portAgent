"""
Judge Router - Validation logic
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from database import get_db
from models import Dossier, Provenance, Facture, Marchandise, DossierStatus

router = APIRouter()


class JudgeRequest(BaseModel):
    dossier_id: str


class JudgeResponse(BaseModel):
    status: str  # "OK" or "MISSING"
    score: int  # 0-100
    missing_fields: List[str]
    warnings: List[str]
    ready_to_submit: bool


@router.post("/judge", response_model=JudgeResponse)
async def validate_dossier(
    request: JudgeRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Validate a dossier against PortNet business rules.
    Returns validation status, missing fields, and warnings.
    """
    try:
        dossier_uuid = uuid.UUID(request.dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    dossier = db.query(Dossier).filter(Dossier.id == dossier_uuid).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    missing_fields = []
    warnings = []
    score = 100
    
    # Check provenances
    provenances = db.query(Provenance).filter(Provenance.dossier_id == dossier_uuid).all()
    if not provenances:
        missing_fields.append("Pays de provenance")
        score -= 20
    
    # Check factures
    factures = db.query(Facture).filter(Facture.dossier_id == dossier_uuid).all()
    if not factures:
        missing_fields.append("Facture commerciale")
        score -= 25
    else:
        for f in factures:
            if not f.montant:
                warnings.append("Montant de facture non extrait")
                score -= 5
            if not f.devise:
                warnings.append("Devise non spécifiée")
                score -= 5
    
    # Check marchandises
    marchandises = db.query(Marchandise).filter(Marchandise.dossier_id == dossier_uuid).all()
    if not marchandises:
        missing_fields.append("Marchandises")
        score -= 25
    else:
        for m in marchandises:
            if not m.hs_code:
                warnings.append(f"Code HS manquant pour: {m.designation[:30]}...")
                score -= 5
    
    # Type-specific checks
    if dossier.type_ti.value == "EI":
        # EI requires domiciliation
        if not factures or not any(f.montant and f.montant > 0 for f in factures):
            warnings.append("Domiciliation bancaire requise pour EI")
    elif dossier.type_ti.value == "LI":
        # LI requires pré-domiciliation
        warnings.append("Pré-domiciliation requise pour LI")
    
    score = max(0, score)
    status = "OK" if not missing_fields else "MISSING"
    ready = len(missing_fields) == 0 and score >= 80
    
    # Update dossier status
    if ready:
        dossier.status = DossierStatus.VALIDE
    elif missing_fields:
        dossier.status = DossierStatus.EN_COURS
    db.commit()
    
    return JudgeResponse(
        status=status,
        score=score,
        missing_fields=missing_fields,
        warnings=warnings,
        ready_to_submit=ready
    )
