"""
Intake Agent - Analyzes user intent
"""
from typing import Dict, Any
import asyncio

from agents.base import BaseAgent


class IntakeAgent(BaseAgent):
    """Analyzes user intent and extracts key information"""
    
    name = "Intake"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user intent"""
        intent = context.get("intent", "")
        
        # Simulate processing
        await asyncio.sleep(0.1)
        
        # Extract key terms
        extracted = {
            "intent_type": "import",
            "product_mentioned": True if intent else False,
            "country_mentioned": "chine" in intent.lower() or "france" in intent.lower()
        }
        
        return {
            "message": "Intention analysée : création d'un titre d'importation",
            "extracted": extracted
        }
