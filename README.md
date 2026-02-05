# 🚢 PortAgent Trade Copilot

> **Copilote IA pour automatiser les déclarations d'importation sur PortNet Maroc**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

## 🎯 Problématique

Les importateurs marocains passent **des heures** à remplir manuellement les formulaires sur PortNet :
- Saisie répétitive des mêmes données
- Risque d'erreurs de classification douanière
- Besoin de comprendre des réglementations complexes

## 💡 Solution : PortAgent

Un **copilote IA conversationnel** intégré à l'interface PortNet qui :

1. **Guide l'utilisateur** via un chat intelligent avec options cliquables
2. **Extrait automatiquement** les données des factures (OCR via Gemini Vision)
3. **Valide le dossier** avant soumission grâce à un système multi-agents
4. **Soumet à PortNet** en un clic

## ✨ Fonctionnalités

| Fonctionnalité | Description | Statut |
|---------------|-------------|--------|
| 💬 Chat LLM | Conversation intelligente avec Gemini | ✅ |
| 🔘 Options cliquables | UX simplifiée avec boutons | ✅ |
| 📄 OCR Factures | Extraction automatique des données | ✅ |
| ⚙️ Pipeline Multi-Agents | Orchestration TijarIA, Judge, Submit | ✅ |
| ✔️ Validation | Vérification avant soumission | ✅ |
| 📤 Soumission PortNet | Envoi officiel simulé | ✅ |
| 🎨 UI PortNet | Interface fidèle à PortNet | ✅ |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ PortNet UI   │  │ ChatWidget   │  │ PipelineWindow│  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────┐
│                   Backend (FastAPI)                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐  │
│  │ /chat  │ │/upload │ │/extract│ │ /judge │ │/submit│  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └───────┘  │
│                         │                                │
│              ┌──────────▼──────────┐                    │
│              │   Gemini AI (LLM)   │                    │
│              └─────────────────────┘                    │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                   PostgreSQL Database                    │
│     Dossiers │ Factures │ Documents │ PipelineEvents    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- Docker (pour PostgreSQL)

### 1. Cloner le repo
```bash
git clone https://github.com/your-org/portagentai-trade-copilot.git
cd portagentai-trade-copilot
```

### 2. Lancer la base de données
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurer l'API Gemini (optionnel mais recommandé)
echo "GEMINI_API_KEY=your_key_here" > .env

# Lancer le serveur
uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3000
```

### 5. Ouvrir l'application
→ http://localhost:3000

## 📖 Utilisation

1. Cliquer sur le **bouton flottant PortAgent** (en bas à droite)
2. Choisir "**Créer un nouveau titre**"
3. Suivre le flow guidé :
   - Type de titre (EI/LI)
   - Pays de provenance
   - Marchandise
   - Upload facture (OCR automatique)
4. **Valider** puis **Soumettre**

## 🔑 Configuration API Gemini

Pour activer le LLM intelligent :

```bash
# Obtenir une clé sur https://ai.google.dev/
echo "GEMINI_API_KEY=AIzaSy..." >> backend/.env
```

Sans clé API, le système utilise des réponses basées sur mots-clés.

## 📁 Structure du Projet

```
portagentai-trade-copilot/
├── backend/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── routers/
│   │   ├── chat.py          # LLM Chat endpoint
│   │   ├── upload.py        # Upload fichiers
│   │   ├── extraction.py    # OCR Gemini Vision
│   │   ├── judge.py         # Validation
│   │   ├── submit.py        # Soumission
│   │   └── autopilot.py     # Orchestration
│   ├── models.py            # SQLAlchemy models
│   └── database.py          # Config DB
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── PortNet/     # UI PortNet
│   │   │   └── PortAgent/   # Chat & Pipeline
│   │   └── index.css        # Styles globaux
│   └── public/assets/
└── docker-compose.yml
```


## 📄 License

MIT License - Voir [LICENSE](./LICENSE)

---

<p align="center">
  <b>🏆 Développé pour le Hackathon Smart Trade Challenge 2026</b>
</p>
