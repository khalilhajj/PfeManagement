# InternFlow - Système de Gestion de PFE (Projet de Fin d'Études)

## 📋 Description

**InternFlow** est une plateforme complète de gestion des projets de fin d'études (PFE) et des stages. Le système permet de gérer l'ensemble du cycle de vie d'un projet, depuis la création d'une offre de stage jusqu'à la soutenance finale, en passant par la soumission de rapports et leur évaluation.

## 🎯 Objectifs du Projet

Ce système vise à :
- **Simplifier la gestion** des projets de fin d'études et des stages
- **Automatiser les processus** d'approbation et de suivi
- **Faciliter la communication** entre étudiants, enseignants, entreprises et administrateurs
- **Optimiser le matching** entre candidats et offres grâce à l'IA
- **Centraliser** toutes les informations relatives aux PFE dans une seule plateforme

## 🏗️ Architecture

Le projet suit une architecture **full-stack** avec séparation claire entre le backend et le frontend :

- **Backend** : Django REST Framework (Python)
- **Frontend** : React.js
- **Base de données** : PostgreSQL
- **Cache/Broker** : Redis
- **Tâches asynchrones** : Celery
- **WebSockets** : Django Channels
- **IA** : Groq API (LLaMA 3.1) pour l'analyse de CV et le matching

## 📁 Structure du Projet

```
PfeManagement/
├── backend/                    # Application Django
│   ├── authentication/        # Gestion des utilisateurs et authentification
│   ├── student/               # Fonctionnalités étudiantes
│   ├── internship/            # Gestion des stages/PFE
│   ├── administrator/         # Fonctionnalités administrateur
│   ├── report/                 # Gestion des rapports
│   └── PfeManagement/         # Configuration Django
├── frontend/                  # Application React
│   ├── src/
│   │   ├── pages/             # Pages de l'application
│   │   ├── Components/        # Composants réutilisables
│   │   └── Data/              # Données de configuration
│   └── public/
├── docker-compose.yml         # Configuration Docker
└── Automation.py              # Script d'automatisation Selenium
```

## 🔑 Fonctionnalités Principales

### 👥 Gestion des Utilisateurs

Le système supporte **4 types de rôles** :

1. **Administrator** : Gestion complète du système
   - Création et gestion des utilisateurs
   - Approbation/rejet des stages et offres
   - Gestion des salles
   - Planification des soutenances
   - Statistiques et rapports

2. **Student** : Fonctionnalités étudiantes
   - Création et gestion de stages/PFE
   - Invitation d'enseignants comme superviseurs
   - Consultation et candidature aux offres d'entreprises
   - Soumission de rapports
   - Consultation des notifications

3. **Teacher** : Fonctionnalités enseignantes
   - Réception et gestion des invitations de supervision
   - Révision et évaluation des rapports
   - Participation aux jurys de soutenance
   - Consultation des stages supervisés

4. **Company** : Fonctionnalités entreprises
   - Publication d'offres de stage
   - Réception et évaluation des candidatures
   - Gestion des créneaux d'entretien
   - Analyse des candidats avec matching IA

### 📚 Gestion des Stages/PFE

#### Création et Approbation
- Les étudiants peuvent créer des stages/PFE avec :
  - Informations de l'entreprise
  - Dates de début et de fin
  - Description du projet
  - Cahier des charges (fichier PDF)
- Les administrateurs approuvent ou rejettent les stages
- Statuts disponibles : Pending, Approved, Rejected, In Progress, Completed

#### Invitation de Superviseurs
- Les étudiants peuvent inviter des enseignants comme superviseurs
- Les enseignants reçoivent des notifications en temps réel
- Système d'acceptation/rejet des invitations

### 🏢 Offres d'Entreprises

#### Publication d'Offres
- Les entreprises peuvent publier des offres de stage
- Chaque offre contient :
  - Titre et description
  - Exigences et compétences requises
  - Localisation et durée
  - Dates de début et de fin
  - Nombre de postes disponibles
- Approbation par l'administrateur avant publication

#### Candidatures
- Les étudiants peuvent consulter et candidater aux offres
- Upload de CV et lettre de motivation
- **Matching IA** : Calcul automatique du score de correspondance (0-100%)
- Analyse détaillée des forces et faiblesses du candidat

#### Gestion des Entretiens
- Les entreprises créent des créneaux d'entretien
- Les étudiants sélectionnent un créneau disponible
- Suivi du statut : Pending → Interview → Accepted/Rejected

### 📄 Gestion des Rapports

#### Soumission de Rapports
- Les étudiants soumettent des versions de leur rapport
- Système de versioning automatique
- Statuts : Draft → Pending Review → Approved/Needs Revision

#### Révision par les Enseignants
- Les enseignants peuvent :
  - Approuver ou rejeter une version
  - Ajouter des commentaires détaillés
  - Marquer une version comme finale
  - Attribuer une note finale (0-20)

### 🎓 Planification des Soutenances

#### Gestion des Salles
- Les administrateurs gèrent les salles disponibles
- Informations : nom, bâtiment, étage, capacité, équipements

#### Création de Soutenances
- Planification de la date, heure et salle
- Attribution des membres du jury
- Suivi du statut : Planned → Done
- Attribution des notes

### 🔔 Notifications en Temps Réel

- Système de notifications via **WebSockets** (Django Channels)
- Notifications pour :
  - Nouvelles invitations
  - Approbations/rejets de stages
  - Nouvelles candidatures
  - Commentaires sur les rapports
  - Mises à jour de soutenances

### 🤖 Intelligence Artificielle

#### Analyse de CV
- Utilisation de **Groq API** avec **LLaMA 3.1**
- Analyse automatique des CV en PDF
- Retour structuré :
  - **À conserver** : Points forts du CV
  - **À retirer** : Points faibles ou obsolètes
  - **À améliorer** : Recommandations d'amélioration

#### Matching Candidat-Offre
- Calcul automatique du score de correspondance (0-100%)
- Analyse basée sur :
  - Contenu du CV
  - Lettre de motivation
  - Compétences requises vs compétences du candidat
- Rapport détaillé avec forces, faiblesses et recommandation

## 🛠️ Technologies Utilisées

### Backend
- **Django 5.2.7** : Framework web Python
- **Django REST Framework** : API REST
- **Django Channels** : WebSockets pour les notifications
- **Daphne** : Serveur ASGI
- **Celery 5.4.0** : Tâches asynchrones
- **Redis** : Broker et cache
- **PostgreSQL** : Base de données
- **JWT** : Authentification (SimpleJWT)
- **Swagger/OpenAPI** : Documentation API (drf-yasg)

### Frontend
- **React 19.2.0** : Bibliothèque JavaScript
- **React Router** : Navigation
- **Axios** : Requêtes HTTP
- **Bootstrap 5.3.8** : Framework CSS
- **React Bootstrap** : Composants Bootstrap pour React
- **Recharts** : Graphiques et statistiques
- **JWT Decode** : Décodage des tokens

### IA et Analyse
- **Groq API** : API pour LLaMA 3.1
- **LangChain** : Framework pour applications LLM
- **PyPDF** : Extraction de texte depuis PDF
- **Sentence Transformers** : Embeddings de texte

### DevOps
- **Docker** : Conteneurisation
- **Docker Compose** : Orchestration
- **Flower** : Monitoring Celery
- **PgAdmin** : Interface PostgreSQL

## 🚀 Installation et Configuration

### Prérequis

- Docker et Docker Compose installés
- Clé API Groq (gratuite sur https://console.groq.com)

### Configuration

1. **Cloner le dépôt**
```bash
git clone <repository-url>
cd PfeManagement
```

2. **Créer le fichier `.env`** à la racine du projet :
```env
# Django
DJANGO_SECRET_KEY=votre_secret_key_ici
DEBUG=True
DJANGO_LOGLEVEL=info
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=PFE
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_HOST=postgres
DATABASE_PORT=5432

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Groq API (pour l'IA)
GROQ_API_KEY=votre_groq_api_key_ici

# Frontend
FRONTEND_URL=http://localhost:3000
```

3. **Lancer les services avec Docker Compose**
```bash
docker-compose up --build
```

Les services seront disponibles sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Swagger Documentation** : http://localhost:8000/swagger/
- **ReDoc Documentation** : http://localhost:8000/redoc/
- **PgAdmin** : http://localhost:5050
- **Flower (Celery)** : http://localhost:5555

### Première Configuration

1. **Créer un superutilisateur** (dans le conteneur backend) :
```bash
docker exec -it django-backend python manage.py createsuperuser
```

2. **Accéder à l'interface d'administration** :
   - URL : http://localhost:8000/admin/
   - Utiliser les identifiants du superutilisateur

3. **Créer les rôles** dans l'admin Django :
   - Administrator
   - Student
   - Teacher
   - Company

## 📡 API Endpoints Principaux

### Authentification (`/auth/`)
- `POST /auth/login/` : Connexion
- `POST /auth/register/` : Inscription
- `GET /auth/user/` : Informations utilisateur
- `PUT /auth/user/` : Mise à jour du profil
- `POST /auth/change-password/` : Changer le mot de passe
- `GET /auth/activate/<token>/` : Activer un compte

### Stages (`/internship/`)
- `POST /internship/create/` : Créer un stage
- `GET /internship/my-internships/` : Mes stages (étudiant)
- `GET /internship/<id>/` : Détails d'un stage
- `POST /internship/invite/` : Inviter un enseignant
- `GET /internship/teacher/invitations/` : Invitations reçues (enseignant)
- `POST /internship/invitation/<id>/respond/` : Répondre à une invitation
- `GET /internship/admin/pending/` : Stages en attente (admin)
- `POST /internship/admin/<id>/approve/` : Approuver un stage
- `POST /internship/admin/<id>/reject/` : Rejeter un stage

### Offres d'Entreprises (`/internship/offers/`)
- `GET /internship/offers/` : Liste des offres (entreprise)
- `POST /internship/offers/` : Créer une offre
- `GET /internship/browse/` : Parcourir les offres (étudiant)
- `POST /internship/apply/` : Candidater à une offre
- `GET /internship/my-applications/` : Mes candidatures
- `GET /internship/offers/<id>/applications/` : Candidatures à une offre
- `POST /internship/applications/<id>/review/` : Examiner une candidature
- `POST /internship/applications/<id>/calculate-match/` : Calculer le matching IA

### Rapports (`/report/`)
- `POST /report/create/` : Créer un rapport
- `GET /report/my-reports/` : Mes rapports (étudiant)
- `POST /report/<id>/submit-version/` : Soumettre une version
- `GET /report/pending/` : Rapports en attente (enseignant)
- `POST /report/version/<id>/approve/` : Approuver une version
- `POST /report/version/<id>/reject/` : Rejeter une version

### Soutenances (`/internship/soutenances/`)
- `GET /internship/soutenances/` : Liste des soutenances
- `POST /internship/soutenances/` : Créer une soutenance
- `GET /internship/soutenances/candidates/` : Candidats éligibles
- `GET /internship/soutenances/<id>/` : Détails d'une soutenance

### Administration (`/administrator/`)
- `GET /administrator/users/` : Liste des utilisateurs
- `POST /administrator/users/` : Créer un utilisateur
- `PATCH /administrator/users/<id>/` : Modifier un utilisateur
- `DELETE /administrator/users/<id>/` : Supprimer un utilisateur
- `GET /administrator/stats/` : Statistiques
- `GET /administrator/rooms/` : Liste des salles
- `POST /administrator/rooms/` : Créer une salle

### Étudiants (`/student/`)
- `POST /student/upload-cv/` : Uploader un CV
- `POST /student/analyze-cv/` : Analyser un CV avec IA

### Notifications (`/internship/notifications/`)
- `GET /internship/notifications/` : Liste des notifications
- `POST /internship/notifications/<id>/read/` : Marquer comme lu
- `POST /internship/notifications/read-all/` : Tout marquer comme lu

## 🔐 Sécurité

- **Authentification JWT** : Tokens d'accès et de rafraîchissement
- **Permissions basées sur les rôles** : Contrôle d'accès granulaire
- **Validation des données** : Sérialiseurs Django REST Framework
- **CORS configuré** : Accès contrôlé depuis le frontend
- **Activation de compte** : Système d'activation par email
- **Mots de passe sécurisés** : Hachage avec Django

## 📊 Tâches Asynchrones (Celery)

### Tâches Configurées
- **Désactivation des utilisateurs inactifs** : Exécutée quotidiennement à 2h00
- **Envoi d'emails** : Notifications par email (configurable)

### Monitoring
- **Flower** : Interface web pour surveiller les tâches Celery
- Accès : http://localhost:5555

## 🧪 Tests

Le projet inclut des tests unitaires pour chaque application :

```bash
# Lancer les tests
docker exec -it django-backend pytest

# Avec couverture
docker exec -it django-backend pytest --cov
```

## 📝 Documentation API

La documentation complète de l'API est disponible via Swagger :
- **Swagger UI** : http://localhost:8000/swagger/
- **ReDoc** : http://localhost:8000/redoc/
- **JSON Schema** : http://localhost:8000/swagger.json

## 🔄 Workflow Typique

### Pour un Étudiant
1. Se connecter avec ses identifiants
2. Créer un stage/PFE ou candidater à une offre
3. Attendre l'approbation de l'administrateur
4. Inviter un enseignant comme superviseur
5. Soumettre des versions de rapport
6. Recevoir des commentaires et améliorer
7. Participer à la soutenance

### Pour un Enseignant
1. Recevoir une invitation de supervision
2. Accepter ou refuser l'invitation
3. Suivre l'avancement du stage
4. Réviser les rapports soumis
5. Participer aux jurys de soutenance

### Pour une Entreprise
1. Publier une offre de stage
2. Attendre l'approbation de l'administrateur
3. Recevoir des candidatures
4. Examiner les candidatures avec matching IA
5. Créer des créneaux d'entretien
6. Sélectionner les candidats retenus

### Pour un Administrateur
1. Gérer les utilisateurs (création, modification, suppression)
2. Approuver/rejeter les stages et offres
3. Gérer les salles
4. Planifier les soutenances
5. Consulter les statistiques

## 🤖 Fonctionnalités IA

### Analyse de CV
- **Endpoint** : `POST /student/analyze-cv/`
- **Fonctionnalité** : Analyse automatique d'un CV PDF
- **Retour** : Points forts, points faibles, recommandations

### Matching Candidat-Offre
- **Endpoint** : `POST /internship/applications/<id>/calculate-match/`
- **Fonctionnalité** : Calcul du score de correspondance
- **Retour** : Score (0-100%), analyse détaillée, recommandation

## 📱 Interface Utilisateur

L'interface React offre :
- **Dashboard personnalisé** selon le rôle
- **Navigation intuitive** avec sidebar
- **Design responsive** avec Bootstrap
- **Notifications en temps réel** via WebSockets
- **Graphiques et statistiques** avec Recharts

## 🐳 Docker

### Services Docker
- **postgres** : Base de données PostgreSQL
- **pgadmin** : Interface d'administration PostgreSQL
- **redis** : Broker Redis pour Celery
- **backend** : Application Django
- **celery-worker** : Worker Celery pour les tâches asynchrones
- **celery-beat** : Scheduler Celery pour les tâches périodiques
- **flower** : Monitoring Celery
- **frontend** : Application React

### Commandes Utiles

```bash
# Démarrer tous les services
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f backend

# Reconstruire les images
docker-compose build --no-cache

# Accéder au shell du backend
docker exec -it django-backend bash

# Exécuter des migrations
docker exec -it django-backend python manage.py migrate

# Créer un superutilisateur
docker exec -it django-backend python manage.py createsuperuser
```

## 🔧 Développement

### Structure des Modèles Principaux

#### User (authentication)
- Informations de base (username, email, nom, prénom)
- Rôle (Administrator, Student, Teacher, Company)
- Photo de profil
- Statut d'activation

#### Internship (internship)
- Étudiant et enseignant superviseur
- Type (PFE, Stage, Internship)
- Entreprise et dates
- Statut (Pending, Approved, Rejected, In Progress, Completed)
- Cahier des charges

#### InternshipOffer (internship)
- Entreprise
- Titre, description, exigences
- Dates et localisation
- Statut d'approbation

#### InternshipApplication (internship)
- Offre et étudiant
- CV et lettre de motivation
- Score de matching IA
- Statut (Pending, Interview, Accepted, Rejected)

#### Report (report)
- Stage associé
- Versions multiples
- Statut de révision
- Note finale

#### Soutenance (internship)
- Stage associé
- Date, heure, salle
- Jury
- Note

## 📈 Statistiques et Rapports

Les administrateurs peuvent consulter :
- Nombre total d'utilisateurs par rôle
- Nombre de stages par statut
- Nombre d'offres publiées
- Taux d'acceptation des candidatures
- Statistiques de soutenances

## 🚨 Gestion des Erreurs

Le système gère :
- Erreurs de validation des données
- Erreurs d'authentification/autorisation
- Erreurs de fichiers (upload)
- Erreurs API externes (Groq)
- Erreurs de base de données


## 🔮 Améliorations Futures

- [ ] Intégration d'un système d'email réel (SMTP)
- [ ] Application mobile
- [ ] Calendrier intégré pour les soutenances
- [ ] Intégration avec des systèmes externes (LDAP, etc.)
- [ ] Dashboard analytique avancé
- [ ] Système de backup automatique

---

**Note** : Ce projet est un système complet de gestion de PFE avec des fonctionnalités avancées d'IA et de gestion en temps réel. Pour toute question technique, référez-vous à la documentation Swagger ou aux commentaires dans le code source.
