"""
Extractor Agent - Invoice data extraction
"""
from typing import Dict, Any
import asyncio

from agents.base import BaseAgent
from models import Facture


class ExtractorAgent(BaseAgent):
    """Extracts data from uploaded invoices"""
    
    name = "Extracteur"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check and extract invoice data"""
        # Check for existing invoices
        factures = self.db.query(Facture).filter(
            Facture.dossier_id == self.dossier_id
        ).all()
        
        await asyncio.sleep(0.1)
        
        if not factures:
            return {
                "message": "Aucune facture à extraire",
                "extracted": False
            }
        
        # Check if already extracted
        for f in factures:
            if f.extracted_data:
                return {
                    "message": f"Facture analysée : {f.fournisseur or 'N/A'}",
                    "extracted": True,
                    "data": {
                        "fournisseur": f.fournisseur,
                        "montant": f.montant,
                        "devise": f.devise
                    }
                }
        
        return {
            "message": "Factures détectées, en attente d'extraction",
            "extracted": False
        }
