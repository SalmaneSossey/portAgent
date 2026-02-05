"""
TijarIA Agent - Knowledge base and HS code lookup
"""
from typing import Dict, Any, List
import asyncio
import random

from agents.base import BaseAgent


class TijariaAgent(BaseAgent):
    """Queries knowledge base for regulations and HS codes"""
    
    name = "TijarIA"
    
    # Mock HS codes
    HS_DATABASE = {
        "textile": {"code": "6204.62", "label": "Vêtements en coton"},
        "electronique": {"code": "8471.30", "label": "Ordinateurs portables"},
        "automobile": {"code": "8708.99", "label": "Pièces automobiles"},
        "alimentaire": {"code": "0901.21", "label": "Café torréfié"},
        "default": {"code": "9999.99", "label": "Autres marchandises"}
    }
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Query knowledge base"""
        product = context.get("product", "").lower()
        
        # Simulate KB query
        await asyncio.sleep(random.uniform(0.2, 0.5))
        
        # Find matching HS code
        hs_candidates = []
        for key, value in self.HS_DATABASE.items():
            if key in product:
                hs_candidates.append({
                    "code": value["code"],
                    "label": value["label"],
                    "confidence": random.uniform(0.85, 0.98)
                })
        
        if not hs_candidates:
            hs_candidates.append({
                **self.HS_DATABASE["default"],
                "confidence": 0.5
            })
        
        return {
            "message": f"Code HS suggéré : {hs_candidates[0]['code']}",
            "hs_candidates": hs_candidates,
            "regulations": [
                "Certificat d'origine requis",
                "Facture commerciale obligatoire"
            ]
        }
