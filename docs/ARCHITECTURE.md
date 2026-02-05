# 🏗️ Architecture Technique - PortAgent Trade Copilot

## Vue d'Ensemble

PortAgent est une application web full-stack composée de :
- **Frontend** : React + TypeScript + Vite
- **Backend** : FastAPI + SQLAlchemy + PostgreSQL
- **IA** : Google Gemini (LLM + Vision)

## 🌐 Frontend

### Stack Technique
- **React 18** - UI Components
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons

### Structure des Composants

```
src/
├── App.tsx                 # Point d'entrée, state global
├── components/
│   ├── PortNet/
│   │   └── Layout.tsx      # UI PortNet (header, sidebar, forms)
│   └── PortAgent/
│       ├── FloatingButton.tsx  # Bouton flottant
│       ├── ChatWidget.tsx      # Chat conversationnel
│       └── PipelineWindow.tsx  # Visualisation pipeline
└── index.css               # Styles globaux
```

### State Management
- **useState** pour état local (messages, input, options)
- **Props drilling** pour communication parent-enfant
- **Conversation History** maintenu pour contexte LLM

### API Calls
```typescript
// Exemple : Appel chat LLM
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    dossier_id: dossierId,
    conversation_history: history
  })
})
```

## ⚡ Backend

### Stack Technique
- **FastAPI** - Framework async Python
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **PostgreSQL** - Base de données
- **google-generativeai** - SDK Gemini

### Routers (Endpoints)

| Router | Endpoint | Description |
|--------|----------|-------------|
| `chat.py` | `POST /api/chat` | Conversation LLM |
| `dossiers.py` | `CRUD /api/dossiers` | Gestion dossiers |
| `upload.py` | `POST /api/upload` | Upload fichiers |
| `extraction.py` | `POST /api/extract-invoice` | OCR factures |
| `judge.py` | `POST /api/judge` | Validation |
| `submit.py` | `POST /api/submit` | Soumission |
| `autopilot.py` | `POST /api/autopilot/run` | Orchestration |

### Modèles de Données

```python
class Dossier:
    id: UUID
    type_ti: Enum(EI, LI)
    status: Enum(BROUILLON, EN_COURS, VALIDE, SOUMIS)
    importateur: str
    provenance: str
    reference: str  # Référence PortNet

class Facture:
    id: UUID
    dossier_id: UUID (FK)
    fournisseur: str
    montant: float
    devise: str
    date_facture: date

class PipelineEvent:
    id: UUID
    dossier_id: UUID (FK)
    agent: str  # router, tijaria, judge, submit
    status: Enum(pending, running, success, error)
    message_readable: str
    duration_ms: int
```

## 🤖 Intégration IA (Gemini)

### Chat LLM

```python
# Prompt système
SYSTEM_PROMPT = """
Tu es PortAgent, assistant IA pour PortNet Maroc.
Réponds en JSON avec: message, intent, options, action
"""

# Génération
model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.start_chat(history).send_message(user_msg)
```

### OCR Vision (Extraction Factures)

```python
# Upload image + extraction
model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.generate_content([
    "Extrais les données de cette facture: fournisseur, montant, devise, date, référence",
    image_data
])
```

## 🔄 Flow de Données

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Utilisateur   │────▶│   ChatWidget   │────▶│  /api/chat  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                         ┌───────────────────────▼───────────────────────┐
                         │                  Gemini LLM                    │
                         │   Analyse intent → Génère options → Action    │
                         └───────────────────────┬───────────────────────┘
                                                 │
     ┌───────────────────┬───────────────────────┼───────────────────────┐
     ▼                   ▼                       ▼                       ▼
┌─────────┐       ┌───────────┐           ┌───────────┐           ┌──────────┐
│ /upload │       │ /extract  │           │  /judge   │           │ /submit  │
└────┬────┘       └─────┬─────┘           └─────┬─────┘           └────┬─────┘
     │                  │                       │                      │
     ▼                  ▼                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PostgreSQL                                      │
│                    Dossiers, Factures, PipelineEvents                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔒 Sécurité

### Actuel (Hackathon)
- CORS permissif pour dev local
- Pas d'authentification
- Variables d'env pour clés API

### Production (Recommandé)
- [ ] JWT Authentication
- [ ] Rate limiting
- [ ] Validation input stricte
- [ ] HTTPS obligatoire
- [ ] Secrets manager (Vault)

## 📦 Déploiement

### Docker Compose (Dev)
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: portagent
      POSTGRES_USER: portagent
      POSTGRES_PASSWORD: portagent
    ports:
      - "5432:5432"
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Servir static files depuis FastAPI
app.mount("/", StaticFiles(directory="frontend/dist"))
```

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| Temps réponse chat | < 2s |
| Extraction OCR | < 5s |
| Validation dossier | < 1s |
| Polling pipeline | 2s interval |

---

*Documentation générée le 5 Février 2026*
