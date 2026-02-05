# 🗺️ PortAgent Trade Copilot - Roadmap

## ✅ Ce qui a été fait

### Phase 1 : Infrastructure ✅
- [x] Setup projet FastAPI + React + Vite
- [x] Configuration Docker + PostgreSQL
- [x] Modèles de données (Dossier, Facture, Document, PipelineEvent)
- [x] Migrations Alembic

### Phase 2 : UI PortNet ✅
- [x] Layout fidèle à PortNet (header, sidebar, content)
- [x] Formulaire "Nouveau Titre d'Importation"
- [x] Toggle Mode Manuel/Assisté
- [x] Navigation sidebar fonctionnelle (Dashboard, Gestion, etc.)

### Phase 3 : Chat Widget PortAgent ✅
- [x] Bouton flottant avec logo PortAgent
- [x] Interface chat moderne
- [x] Intégration API `/api/chat` avec Gemini LLM
- [x] Options cliquables (boutons de réponse)
- [x] Historique de conversation pour contexte LLM
- [x] Upload de fichiers via bouton 📎

### Phase 4 : Pipeline Multi-Agents ✅
- [x] Fenêtre Pipeline avec visualisation des étapes
- [x] Polling temps réel des événements (`/api/dossiers/{id}/events`)
- [x] Agents : Router, TijarIA, Judge, Submit
- [x] Statuts : pending, running, success, error

### Phase 5 : Flow Complet ✅
- [x] OCR extraction via Gemini Vision (mock + réel)
- [x] Affichage des données extraites
- [x] Boutons Confirmer/Modifier
- [x] Validation avec `/api/judge`
- [x] Soumission avec `/api/submit`
- [x] Génération référence PortNet

---

## 🔜 Prochaines Étapes (À Faire)

### Priorité Haute 🔴

#### 1. Activer Gemini LLM Réel
```bash
# Ajouter dans backend/.env
GEMINI_API_KEY=AIzaSy...
```
- [ ] Tester les conversations intelligentes
- [ ] Améliorer les prompts système

#### 2. OCR Vision Réel
- [ ] Utiliser Gemini 2.0 Flash avec vision
- [ ] Parser les PDFs de factures
- [ ] Extraire : fournisseur, montant, devise, date, référence

#### 3. Intégration TijarIA
- [ ] Endpoint `/api/tijaria/classify` pour codes HS
- [ ] Recherche réglementations import
- [ ] Afficher les suggestions dans le chat

### Priorité Moyenne 🟡

#### 4. Améliorer l'UX
- [ ] Animation typing dans le chat
- [ ] Transition smooth du pipeline
- [ ] Confetti/Success animation à la soumission
- [ ] Toast notifications

#### 5. Robustesse
- [ ] Gestion d'erreurs complète
- [ ] Retry automatique sur échec API
- [ ] Mode offline graceful

#### 6. Dashboard Enrichi
- [ ] Statistiques réelles depuis la DB
- [ ] Graphiques (titres par mois, par pays)
- [ ] Liste des dossiers récents

### Priorité Basse 🟢

#### 7. Fonctionnalités Avancées
- [ ] Export PDF du récapitulatif
- [ ] Historique des dossiers
- [ ] Multi-utilisateurs
- [ ] Authentification

#### 8. Déploiement
- [ ] Dockerfile production
- [ ] CI/CD GitHub Actions
- [ ] Déploiement cloud (Railway/Render)

---

## 🎯 Perspectives Futures

### Court Terme (Hackathon)
- Démo fluide end-to-end
- Vidéo de présentation
- Pitch deck percutant

### Moyen Terme (Post-Hackathon)
- Partenariat avec PortNet SA
- Pilote avec importateurs réels
- Intégration API PortNet officielle

### Long Terme (Vision)
- SaaS pour déclarants en douane
- Support multi-pays (OHADA, CEDEAO)
- IA prédictive (délais, coûts)

---

## 📊 Métriques de Succès

| Métrique | Avant PortAgent | Avec PortAgent |
|----------|-----------------|----------------|
| Temps de déclaration | 45 min | 5 min |
| Erreurs de saisie | 15% | <1% |
| Formations nécessaires | 2 jours | 30 min |
| Satisfaction utilisateur | 3/5 | 5/5 |

---

## 🤝 Comment Contribuer

1. Fork le repo
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Add: ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

*Dernière mise à jour : 5 Février 2026*
