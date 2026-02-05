"""
Compliance Agent - Regulatory compliance checks
"""
from typing import Dict, Any
import asyncio

from agents.base import BaseAgent
from models import Dossier


class ComplianceAgent(BaseAgent):
    """Checks regulatory compliance"""
    
    name = "Conformité"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check compliance rules"""
        await asyncio.sleep(0.15)
        
        dossier = self.db.query(Dossier).filter(
            Dossier.id == self.dossier_id
        ).first()
        
        warnings = []
        
        if dossier and dossier.type_ti.value == "EI":
            warnings.append("Domiciliation bancaire requise pour EI")
        elif dossier and dossier.type_ti.value == "LI":
            warnings.append("Pré-domiciliation requise pour LI")
        
        return {
            "message": "Vérification de conformité effectuée",
            "warnings": warnings,
            "compliant": len(warnings) == 0
        }
