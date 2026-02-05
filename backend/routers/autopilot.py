"""
Autopilot Router - Main orchestration endpoint
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

from database import get_db
from models import Dossier
from agents.orchestrator import OrchestratorAgent

router = APIRouter()


class AutopilotRequest(BaseModel):
    dossier_id: str
    intent_text: str
    mode: str = "assiste"  # "assiste" or "manuel"


class PipelineStep(BaseModel):
    agent: str
    status: str
    duration_ms: int
    message: str


class AutopilotResponse(BaseModel):
    next_question: Optional[str]
    suggestions: Dict[str, Any]
    ui_actions: List[Dict[str, str]]
    pipeline_progress: List[PipelineStep]


@router.post("/autopilot/run", response_model=AutopilotResponse)
async def run_autopilot(
    request: AutopilotRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Run the multi-agent autopilot pipeline.
    Returns suggestions, UI actions, and pipeline progress.
    """
    try:
        dossier_uuid = uuid.UUID(request.dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    dossier = db.query(Dossier).filter(Dossier.id == dossier_uuid).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    # Run orchestrator
    orchestrator = OrchestratorAgent(db, dossier_uuid)
    result = await orchestrator.run(request.intent_text, request.mode)
    
    return AutopilotResponse(
        next_question=result.get("next_question"),
        suggestions=result.get("suggestions", {}),
        ui_actions=result.get("ui_actions", []),
        pipeline_progress=[
            PipelineStep(**step) for step in result.get("pipeline_progress", [])
        ]
    )
