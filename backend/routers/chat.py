"""
Chat Router - LLM-powered conversation with intent understanding
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import os
import json

from database import get_db

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    message: str
    dossier_id: Optional[str] = None
    conversation_history: List[ChatMessage] = []


class ChatOption(BaseModel):
    id: str
    label: str
    value: str


class ChatResponse(BaseModel):
    message: str
    intent: Optional[str] = None
    options: List[ChatOption] = []
    action: Optional[str] = None  # 'create_dossier', 'upload_document', 'validate', 'submit'


SYSTEM_PROMPT = """Tu es PortAgent, un assistant intelligent pour la gestion des titres d'importation sur PortNet Maroc.

Tu aides les utilisateurs à:
1. Créer des dossiers d'importation (EI - Engagement d'Importation, LI - Licence d'Importation)
2. Remplir les formulaires (pays de provenance, marchandises, factures)
3. Téléverser et extraire des données de factures
4. Valider et soumettre les dossiers

Réponds toujours en français de manière professionnelle mais amicale.

Quand l'utilisateur fait une demande, analyse son intention et propose des options si pertinent.
Structure ta réponse en JSON avec:
{
  "message": "Ta réponse à l'utilisateur",
  "intent": "create_dossier|fill_form|upload_document|validate|submit|question|other",
  "options": [{"id": "opt1", "label": "Texte affiché", "value": "valeur technique"}],
  "action": "action_suggerée ou null"
}

Exemples d'options à proposer:
- Pour le type de titre: EI ou LI
- Pour les pays: proposer les plus courants (Chine, France, Espagne, Allemagne, Turquie)
- Pour les devises: USD, EUR, GBP, CNY
"""


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Process a chat message and return LLM-powered response with options
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("API_KEY")
    
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            # Build conversation history
            history = [{"role": "user", "parts": [SYSTEM_PROMPT]}]
            for msg in request.conversation_history[-10:]:  # Keep last 10 messages
                role = "user" if msg.role == "user" else "model"
                history.append({"role": role, "parts": [msg.content]})
            
            # Add current message
            history.append({"role": "user", "parts": [request.message]})
            
            # Generate response
            chat = model.start_chat(history=history[:-1])
            response = chat.send_message(request.message)
            
            # Parse JSON from response
            text = response.text
            
            # Try to extract JSON
            try:
                # Find JSON in response
                if "```json" in text:
                    json_str = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    json_str = text.split("```")[1].split("```")[0].strip()
                elif "{" in text:
                    start = text.index("{")
                    end = text.rindex("}") + 1
                    json_str = text[start:end]
                else:
                    json_str = text
                
                data = json.loads(json_str)
                
                return ChatResponse(
                    message=data.get("message", text),
                    intent=data.get("intent"),
                    options=[ChatOption(**opt) for opt in data.get("options", [])],
                    action=data.get("action")
                )
            except (json.JSONDecodeError, ValueError):
                # Return plain text response
                return ChatResponse(message=text, options=[])
                
        except Exception as e:
            print(f"LLM error: {e}")
            # Fall through to mock response
    
    # Mock response without LLM
    user_msg = request.message.lower()
    
    if any(word in user_msg for word in ['démarrer', 'commencer', 'nouveau', 'créer']):
        return ChatResponse(
            message="Parfait ! Quel type de titre d'importation souhaitez-vous créer ?",
            intent="create_dossier",
            options=[
                ChatOption(id="ei", label="EI - Engagement d'Importation", value="EI"),
                ChatOption(id="li", label="LI - Licence d'Importation", value="LI")
            ],
            action="create_dossier"
        )
    
    elif any(word in user_msg for word in ['pays', 'provenance', 'origine']):
        return ChatResponse(
            message="De quel pays provient votre marchandise ?",
            intent="fill_form",
            options=[
                ChatOption(id="cn", label="🇨🇳 Chine", value="Chine"),
                ChatOption(id="fr", label="🇫🇷 France", value="France"),
                ChatOption(id="es", label="🇪🇸 Espagne", value="Espagne"),
                ChatOption(id="de", label="🇩🇪 Allemagne", value="Allemagne"),
                ChatOption(id="tr", label="🇹🇷 Turquie", value="Turquie"),
                ChatOption(id="other", label="Autre pays...", value="other")
            ]
        )
    
    elif any(word in user_msg for word in ['facture', 'document', 'téléverser', 'upload']):
        return ChatResponse(
            message="Vous pouvez téléverser votre facture en cliquant sur le bouton 📎 ci-dessous. J'extrairai automatiquement les informations.",
            intent="upload_document",
            action="upload_document"
        )
    
    elif any(word in user_msg for word in ['valider', 'vérifier', 'contrôler']):
        return ChatResponse(
            message="Je vais vérifier votre dossier. Voici les options de validation:",
            intent="validate",
            options=[
                ChatOption(id="val", label="✓ Valider le dossier", value="validate"),
                ChatOption(id="edit", label="✏️ Modifier les informations", value="edit")
            ],
            action="validate"
        )
    
    elif any(word in user_msg for word in ['soumettre', 'envoyer', 'submit']):
        return ChatResponse(
            message="Êtes-vous sûr de vouloir soumettre ce dossier à PortNet ?",
            intent="submit",
            options=[
                ChatOption(id="yes", label="✓ Oui, soumettre", value="submit"),
                ChatOption(id="no", label="Non, réviser", value="cancel")
            ],
            action="submit"
        )
    
    elif 'ei' in user_msg or 'engagement' in user_msg:
        return ChatResponse(
            message="D'accord, je crée un Engagement d'Importation (EI). De quel pays provient votre marchandise ?",
            intent="fill_form",
            options=[
                ChatOption(id="cn", label="🇨🇳 Chine", value="Chine"),
                ChatOption(id="fr", label="🇫🇷 France", value="France"),
                ChatOption(id="es", label="🇪🇸 Espagne", value="Espagne"),
                ChatOption(id="other", label="Autre pays...", value="other")
            ],
            action="create_dossier"
        )
    
    # Handle country selection
    elif any(country in user_msg for country in ['chine', 'france', 'espagne', 'allemagne', 'turquie', 'italy', 'usa', 'états-unis']):
        country_name = user_msg.title()
        return ChatResponse(
            message=f"Parfait, pays de provenance: **{country_name}**. Quelle est la marchandise à importer ?",
            intent="fill_form",
            options=[
                ChatOption(id="textile", label="👕 Textile & Vêtements", value="Textile et vêtements"),
                ChatOption(id="electronic", label="📱 Électronique", value="Produits électroniques"),
                ChatOption(id="machinery", label="⚙️ Machines", value="Machines industrielles"),
                ChatOption(id="food", label="🍎 Alimentaire", value="Produits alimentaires"),
                ChatOption(id="other", label="Autre...", value="autre marchandise")
            ]
        )
    
    # Handle merchandise/product selection
    elif any(word in user_msg for word in ['textile', 'vêtement', 'électronique', 'machine', 'alimentaire', 'produit']):
        product_name = user_msg.title()
        return ChatResponse(
            message=f"Marchandise enregistrée: **{product_name}**. Maintenant, veuillez téléverser votre facture proforma pour que j'extraie les détails.",
            intent="upload_document",
            options=[
                ChatOption(id="upload", label="📎 Téléverser une facture", value="upload"),
                ChatOption(id="manual", label="✏️ Saisir manuellement", value="manual")
            ],
            action="upload_document"
        )
    
    # Handle "nouveau" action from welcome options
    elif user_msg in ['nouveau', 'new', 'créer']:
        return ChatResponse(
            message="Quel type de titre d'importation souhaitez-vous créer ?",
            intent="create_dossier",
            options=[
                ChatOption(id="ei", label="📋 EI - Engagement d'Importation", value="EI"),
                ChatOption(id="li", label="📄 LI - Licence d'Importation", value="LI")
            ],
            action="create_dossier"
        )
    
    # Handle "help" action
    elif user_msg in ['help', 'aide']:
        return ChatResponse(
            message="Je peux vous aider avec:\n\n• **Créer un titre** - Nouveau EI ou LI\n• **Téléverser des factures** - Extraction automatique\n• **Valider un dossier** - Vérification avant soumission\n• **Soumettre à PortNet** - Envoi officiel",
            intent="question",
            options=[
                ChatOption(id="new", label="📝 Créer un titre", value="nouveau"),
                ChatOption(id="status", label="📊 Voir mes dossiers", value="status")
            ]
        )
    
    # Handle "status" action  
    elif user_msg in ['status', 'dossiers', 'mes dossiers']:
        return ChatResponse(
            message="Vous avez **3 dossiers en cours** et **12 dossiers validés**.\n\nVoulez-vous créer un nouveau dossier ou voir les détails ?",
            intent="question",
            options=[
                ChatOption(id="new", label="📝 Nouveau titre", value="nouveau"),
                ChatOption(id="dashboard", label="📊 Aller au tableau de bord", value="dashboard")
            ]
        )
    
    # Handle confirmation
    elif any(word in user_msg for word in ['confirmer', 'oui', 'correct', 'ok', 'parfait']):
        return ChatResponse(
            message="✓ Informations confirmées. Je lance la validation de votre dossier...",
            intent="validate",
            action="validate"
        )
    
    # Handle modification request
    elif any(word in user_msg for word in ['modifier', 'changer', 'corriger', 'edit']):
        return ChatResponse(
            message="Que souhaitez-vous modifier ?",
            intent="fill_form",
            options=[
                ChatOption(id="pays", label="🌍 Pays de provenance", value="pays"),
                ChatOption(id="produit", label="📦 Marchandise", value="produit"),
                ChatOption(id="facture", label="📄 Facture", value="facture")
            ]
        )
    
    else:
        return ChatResponse(
            message="Je suis PortAgent, votre assistant pour les importations. Comment puis-je vous aider ?",
            intent="question",
            options=[
                ChatOption(id="new", label="📝 Créer un nouveau titre", value="nouveau"),
                ChatOption(id="help", label="❓ Aide et documentation", value="help"),
                ChatOption(id="status", label="📊 Voir mes dossiers", value="status")
            ]
        )

