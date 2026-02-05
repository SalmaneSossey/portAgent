"""
Base Agent Class
"""
from abc import ABC, abstractmethod
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid
import time

from models import PipelineEvent, PipelineStatus


class BaseAgent(ABC):
    """Base class for all agents in the pipeline"""
    
    name: str = "BaseAgent"
    
    def __init__(self, db: Session, dossier_id: uuid.UUID):
        self.db = db
        self.dossier_id = dossier_id
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent logic - must be implemented by subclasses"""
        pass
    
    async def run(self, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Run the agent and record pipeline event"""
        context = context or {}
        start_time = time.time()
        
        # Record start event
        self._record_event(PipelineStatus.RUNNING, 0, "En cours...")
        
        try:
            result = await self.execute(context)
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Record success
            message = result.get("message", "Terminé avec succès")
            self._record_event(PipelineStatus.SUCCESS, duration_ms, message)
            
            result["duration_ms"] = duration_ms
            result["status"] = "success"
            return result
            
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            self._record_event(PipelineStatus.ERROR, duration_ms, f"Erreur: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "duration_ms": duration_ms
            }
    
    def _record_event(self, status: PipelineStatus, duration_ms: int, message: str):
        """Record a pipeline event to the database"""
        event = PipelineEvent(
            dossier_id=self.dossier_id,
            agent=self.name,
            step=self.name.lower(),
            status=status,
            duration_ms=duration_ms,
            message_readable=message,
            ts=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
