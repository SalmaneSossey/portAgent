"""
TijarIA Router - Knowledge Base queries
"""
from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional, List
import os
import asyncio
import random

router = APIRouter()


class TijariaQuery(BaseModel):
    dossier_id: Optional[str] = None
    query: str
    product_description: Optional[str] = None


class HSCandidate(BaseModel):
    code: str
    label: str
    confidence: float


class TijariaResponse(BaseModel):
    answer: str
    checklist: List[str]
    hs_candidates: List[HSCandidate]
    latency_ms: int


# Mock HS code database
HS_CODES = {
    "textile": [
        HSCandidate(code="6204.62", label="Pantalons en coton pour femmes", confidence=0.92),
        HSCandidate(code="6203.42", label="Pantalons en coton pour hommes", confidence=0.88),
        HSCandidate(code="5208.32", label="Tissus de coton teints", confidence=0.75),
    ],
    "automobile": [
        HSCandidate(code="8708.99", label="Parties et accessoires de véhicules", confidence=0.94),
        HSCandidate(code="8407.34", label="Moteurs à piston", confidence=0.82),
        HSCandidate(code="4011.10", label="Pneumatiques neufs", confidence=0.78),
    ],
    "électronique": [
        HSCandidate(code="8471.30", label="Machines automatiques de traitement", confidence=0.91),
        HSCandidate(code="8517.12", label="Téléphones portables", confidence=0.89),
        HSCandidate(code="8528.72", label="Appareils récepteurs de télévision", confidence=0.76),
    ],
    "alimentaire": [
        HSCandidate(code="0901.21", label="Café torréfié non décaféiné", confidence=0.95),
        HSCandidate(code="1806.32", label="Chocolat en tablettes", confidence=0.88),
        HSCandidate(code="2009.11", label="Jus d'orange congelé", confidence=0.82),
    ],
}

REGULATORY_ANSWERS = {
    "certificat": "Pour les produits alimentaires, un certificat sanitaire émis par l'ONSSA est obligatoire. Pour les produits industriels, une attestation de conformité aux normes marocaines (NM) peut être exigée.",
    "douane": "Les droits de douane varient selon le code HS. Pour les textiles (Chapitre 62), le taux est généralement de 25%. Pour l'électronique (Chapitre 85), le taux peut aller de 2.5% à 40%.",
    "origine": "Un certificat d'origine EUR.1 est nécessaire pour bénéficier des préférences tarifaires avec l'UE. Pour les accords de libre-échange, vérifiez les règles d'origine spécifiques.",
    "default": "Je consulte la base de connaissances Tijara. Pour une importation standard, vous aurez besoin: titre d'importation, facture commerciale, certificat d'origine, et documents de transport."
}


@router.post("/tijaria/query", response_model=TijariaResponse)
async def query_tijaria(request: TijariaQuery = Body(...)):
    """
    Query the TijarIA knowledge base for regulations and HS codes.
    """
    start_time = asyncio.get_event_loop().time()
    
    # Simulate processing delay
    await asyncio.sleep(random.uniform(0.3, 0.8))
    
    query_lower = request.query.lower()
    product = request.product_description or request.query
    product_lower = product.lower()
    
    # Find relevant HS codes
    hs_candidates = []
    for category, codes in HS_CODES.items():
        if category in product_lower:
            hs_candidates = codes
            break
    
    # If no match, return generic codes
    if not hs_candidates:
        hs_candidates = [
            HSCandidate(code="9999.99", label="Autres marchandises", confidence=0.50)
        ]
    
    # Find relevant answer
    answer = REGULATORY_ANSWERS.get("default")
    for key, value in REGULATORY_ANSWERS.items():
        if key in query_lower:
            answer = value
            break
    
    # Generate checklist based on query
    checklist = [
        "✓ Vérifier le code HS applicable",
        "✓ Obtenir le certificat d'origine",
        "✓ Préparer la facture commerciale",
        "✓ Demander le titre d'importation",
    ]
    
    if "alimentaire" in product_lower or "café" in product_lower:
        checklist.append("⚠ Certificat sanitaire ONSSA obligatoire")
    
    if "électronique" in product_lower:
        checklist.append("⚠ Attestation de conformité requise")
    
    end_time = asyncio.get_event_loop().time()
    latency_ms = int((end_time - start_time) * 1000)
    
    return TijariaResponse(
        answer=answer,
        checklist=checklist,
        hs_candidates=hs_candidates,
        latency_ms=latency_ms
    )
