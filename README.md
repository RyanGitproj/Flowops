# FlowOps – Système d'Automatisation Backend Basé sur les Événements

Un système d'automatisation backend basé sur les événements et les queues pour un traitement asynchrone scalable.

---

## Problème

Les systèmes backend traditionnels traitent les tâches de manière synchrone, ce qui crée des goulots d'étranglement lors du traitement d'opérations longues. Lorsqu'un utilisateur crée un événement qui déclenche des notifications, du traitement de données ou des intégrations tierces, la requête entière peut expirer ou bloquer d'autres utilisateurs. Cette architecture ne scale pas bien sous charge et offre une mauvaise expérience utilisateur.

---

## Solution

FlowOps utilise une architecture événementielle avec des queues Redis pour découpler les requêtes API du traitement en arrière-plan. Lorsqu'un événement est créé, il est immédiatement confirmé et stocké, puis traité de manière asynchrone par des workers. Cette approche garantit que l'API reste réactive, les tâches sont réessayées automatiquement en cas d'échec, et le système peut scale horizontalement en ajoutant plus de workers.

---

## Architecture

```
Requête Client
     │
     ▼
API NestJS
     │
     ├─► PostgreSQL (stocker événement)
     │
     ├─► Queue Redis (mettre en file job)
     │          │
     │          ▼
     │     Workers (traitement asynchrone)
     │          │
     │          ▼
     │     Base de Logs (résultats)
     │
     └─► Réponse au client (immédiate)
```

---

## Fonctionnalités

- **Authentification** – Inscription et connexion utilisateur basées sur JWT
- **Système d'Événements** – Créer et gérer des événements métier via API REST
- **Traitement par Queue** – BullMQ + Redis pour l'exécution fiable de jobs asynchrones
- **Système de Logs** – Suivi de l'historique de traitement et statistiques
- **Documentation API** – Interface Swagger interactive

---

## Stack Technique

- **Framework** : NestJS (TypeScript)
- **Base de données** : PostgreSQL avec Prisma ORM
- **Queue** : BullMQ + Redis
- **Authentification** : Passport + JWT
- **Documentation** : Swagger / OpenAPI

---

## Fonctionnement

1. **Utilisateur crée événement** – Le client envoie une requête POST vers `/api/v1/events` avec les données de l'événement
2. **Événement stocké** – L'API sauvegarde l'événement dans la base PostgreSQL
3. **Job mis en file** – L'événement est poussé dans la queue Redis pour traitement asynchrone
4. **Worker traite** – Un worker en arrière-plan récupère le job et exécute la logique métier
5. **Log enregistré** – Le résultat du traitement (succès/échec) est logué dans la base
6. **Réponse client** – L'API répond immédiatement sans attendre le traitement

Ce flux garantit que l'API reste rapide et réactive, même lors du traitement de tâches complexes.

---

## Installation

### Prérequis

- Node.js 20+
- Base de données PostgreSQL
- Serveur Redis
- Docker et Docker Compose (pour déploiement)

### Installation locale

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npx prisma migrate dev
npx prisma generate

# Démarrer le serveur de développement
npm run start:dev
```

### Déploiement Docker

```bash
# Démarrer tous les services (PostgreSQL, Redis, API)
docker compose up -d

# Exécuter les migrations de base de données (si nécessaire)
docker compose exec api npm run migrate:deploy
```

**Note :** Les migrations de base de données doivent être exécutées manuellement via `npm run migrate:deploy` si les tables n'existent pas encore. L'API démarre automatiquement et attend que PostgreSQL soit prêt.

### Accéder à l'API

- **API** : http://localhost:3000/api/v1
- **Documentation** : http://localhost:3000/docs
- **Health Check** : http://localhost:3000/api/v1/health

---

## Ce que j'ai appris

- **Architecture Backend** – Conception de systèmes événementiels scalables
- **Systèmes de Queue** – Implémentation de traitement de jobs asynchrones avec BullMQ et Redis
- **Design de Base de Données** – Modélisation des relations de données avec Prisma ORM
- **Structure Modulaire** – Organisation du code NestJS en modules réutilisables
- **Gestion d'Erreurs** – Implémentation de stratégies de retry et logging des échecs
- **Design d'API** – Construction d'API RESTful avec validation et documentation appropriées

---

## Documentation API

Documentation API interactive disponible à : http://localhost:3000/docs

---

## License

© 2026 Tsioritiana Ryan

Contact : ryan@example.com

Ce projet est fourni à des fins éducatives et de démonstration.
