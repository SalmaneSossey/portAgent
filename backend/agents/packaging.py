"""
Packaging Agent - Prepares final submission package
"""
from typing import Dict, Any
import asyncio
import json

from agents.base import BaseAgent
from models import Dossier, Provenance, Facture, Marchandise


class PackagingAgent(BaseAgent):
    """Prepares the final submission package"""
    
    name = "Packaging"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Package all data for submission"""
        await asyncio.sleep(0.1)
        
        # Gather all data
        dossier = self.db.query(Dossier).filter(
            Dossier.id == self.dossier_id
        ).first()
        
        provenances = self.db.query(Provenance).filter(
            Provenance.dossier_id == self.dossier_id
        ).all()
        
        factures = self.db.query(Facture).filter(
            Facture.dossier_id == self.dossier_id
        ).all()
        
        marchandises = self.db.query(Marchandise).filter(
            Marchandise.dossier_id == self.dossier_id
        ).all()
        
        # Create summary
        summary = {
            "type": dossier.type_ti.value if dossier else "EI",
            "provenances": len(provenances),
            "factures": len(factures),
            "marchandises": len(marchandises),
            "montant_total": sum(f.montant or 0 for f in factures)
        }
        
        # Update dossier summary
        if dossier:
            dossier.summary_json_readable = json.dumps(summary, ensure_ascii=False)
            self.db.commit()
        
        return {
            "message": f"Dossier préparé : {len(marchandises)} marchandise(s)",
            "summary": summary
        }
