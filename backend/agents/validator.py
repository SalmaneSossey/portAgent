"""
Validator Agent - Checks dossier completeness
"""
from typing import Dict, Any, List
import asyncio

from agents.base import BaseAgent
from models import Provenance, Facture, Marchandise


class ValidatorAgent(BaseAgent):
    """Validates dossier against business rules"""
    
    name = "Validateur"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate dossier completeness"""
        await asyncio.sleep(0.1)
        
        missing_fields: List[str] = []
        
        # Check provenances
        provenances = self.db.query(Provenance).filter(
            Provenance.dossier_id == self.dossier_id
        ).count()
        if provenances == 0:
            missing_fields.append("Pays de provenance")
        
        # Check factures
        factures = self.db.query(Facture).filter(
            Facture.dossier_id == self.dossier_id
        ).count()
        if factures == 0:
            missing_fields.append("Facture commerciale")
        
        # Check marchandises
        marchandises = self.db.query(Marchandise).filter(
            Marchandise.dossier_id == self.dossier_id
        ).count()
        if marchandises == 0:
            missing_fields.append("Marchandises")
        
        ready = len(missing_fields) == 0
        
        if ready:
            message = "Dossier complet et prêt pour soumission"
        else:
            message = f"Éléments manquants : {', '.join(missing_fields)}"
        
        return {
            "message": message,
            "missing_fields": missing_fields,
            "ready": ready
        }
