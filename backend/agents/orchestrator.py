"""
Orchestrator Agent - Coordinates all other agents
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import uuid
import asyncio

from agents.base import BaseAgent
from agents.intake import IntakeAgent
from agents.tijaria import TijariaAgent
from agents.extractor import ExtractorAgent
from agents.validator import ValidatorAgent
from agents.compliance import ComplianceAgent
from agents.packaging import PackagingAgent
from agents.audit import AuditAgent


class OrchestratorAgent(BaseAgent):
    """Main orchestrator that runs the multi-agent pipeline"""
    
    name = "Orchestrateur"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the orchestration logic"""
        intent = context.get("intent", "")
        return {"message": "Pipeline orchestré avec succès"}
    
    async def run(self, intent_text: str, mode: str = "assiste") -> Dict[str, Any]:
        """
        Run the full pipeline based on user intent.
        Returns suggestions, UI actions, and pipeline progress.
        """
        pipeline_progress = []
        suggestions = {}
        ui_actions = []
        next_question = None
        
        # 1. Intake Agent - Analyze intent
        intake = IntakeAgent(self.db, self.dossier_id)
        intake_result = await intake.run({"intent": intent_text})
        pipeline_progress.append({
            "agent": "Intake",
            "status": intake_result.get("status", "success"),
            "duration_ms": intake_result.get("duration_ms", 0),
            "message": intake_result.get("message", "")
        })
        
        # 2. TijarIA Agent - Get regulations and HS codes
        tijaria = TijariaAgent(self.db, self.dossier_id)
        tijaria_result = await tijaria.run({"product": intent_text})
        pipeline_progress.append({
            "agent": "TijarIA",
            "status": tijaria_result.get("status", "success"),
            "duration_ms": tijaria_result.get("duration_ms", 0),
            "message": tijaria_result.get("message", "")
        })
        
        # If we have HS suggestions, add them
        if tijaria_result.get("hs_candidates"):
            suggestions["hs_code"] = tijaria_result["hs_candidates"][0]["code"]
            suggestions["hs_label"] = tijaria_result["hs_candidates"][0]["label"]
        
        # 3. Extractor Agent - Check for uploaded invoices
        extractor = ExtractorAgent(self.db, self.dossier_id)
        extractor_result = await extractor.run({})
        pipeline_progress.append({
            "agent": "Extracteur",
            "status": extractor_result.get("status", "success"),
            "duration_ms": extractor_result.get("duration_ms", 0),
            "message": extractor_result.get("message", "")
        })
        
        if extractor_result.get("extracted"):
            suggestions.update(extractor_result.get("data", {}))
        
        # 4. Validator Agent - Check completeness
        validator = ValidatorAgent(self.db, self.dossier_id)
        validator_result = await validator.run({})
        pipeline_progress.append({
            "agent": "Validateur",
            "status": validator_result.get("status", "success"),
            "duration_ms": validator_result.get("duration_ms", 0),
            "message": validator_result.get("message", "")
        })
        
        # Determine next question based on missing fields
        missing = validator_result.get("missing_fields", [])
        if "Pays de provenance" in missing:
            next_question = "Quel est le pays de provenance de la marchandise ?"
            ui_actions.append({"action": "open_section", "target": "provenances"})
        elif "Facture commerciale" in missing:
            next_question = "Veuillez téléverser la facture commerciale."
            ui_actions.append({"action": "open_section", "target": "factures"})
        elif "Marchandises" in missing:
            next_question = "Veuillez ajouter au moins une marchandise."
            ui_actions.append({"action": "open_section", "target": "marchandises"})
        
        # 5. Compliance Agent
        compliance = ComplianceAgent(self.db, self.dossier_id)
        compliance_result = await compliance.run({})
        pipeline_progress.append({
            "agent": "Conformité",
            "status": compliance_result.get("status", "success"),
            "duration_ms": compliance_result.get("duration_ms", 0),
            "message": compliance_result.get("message", "")
        })
        
        # 6. Packaging Agent
        packaging = PackagingAgent(self.db, self.dossier_id)
        packaging_result = await packaging.run({})
        pipeline_progress.append({
            "agent": "Packaging",
            "status": packaging_result.get("status", "success"),
            "duration_ms": packaging_result.get("duration_ms", 0),
            "message": packaging_result.get("message", "")
        })
        
        # 7. Audit Agent
        audit = AuditAgent(self.db, self.dossier_id)
        audit_result = await audit.run({})
        pipeline_progress.append({
            "agent": "Audit",
            "status": audit_result.get("status", "success"),
            "duration_ms": audit_result.get("duration_ms", 0),
            "message": audit_result.get("message", "")
        })
        
        # If everything is ready
        if not missing and validator_result.get("ready"):
            next_question = "Votre dossier est complet. Souhaitez-vous le soumettre ?"
            ui_actions.append({"action": "show_submit_button", "target": "main"})
        
        return {
            "next_question": next_question,
            "suggestions": suggestions,
            "ui_actions": ui_actions,
            "pipeline_progress": pipeline_progress
        }
