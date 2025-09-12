# Restaurant Le Concept - Frontend

## Introduction

## Installation

## Utilisation

## Contribution

## Licence

## Auteurs et Contact

## Remerciements

# 🌐 SGEP Frontend - Interface Web du Système de Gestion

> Interface utilisateur moderne développée avec Vue.js 3 pour le système de gestion des entreprises et participations (SGEP)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2-green.svg)](https://vuejs.org)
[![Vuex](https://img.shields.io/badge/Vuex-4.1-orange.svg)](https://vuex.vuejs.org)
[![Vue Router](https://img.shields.io/badge/Vue%20Router-4.0-blue.svg)](https://router.vuejs.org)

## 🎯 Vue d'ensemble

SGEP Frontend est une application web moderne qui fournit une interface utilisateur intuitive pour la gestion complète des entreprises, sessions, administrateurs et toutes les fonctionnalités du système SGEP.

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité
- **Connexion sécurisée** avec JWT tokens
- **Gestion des permissions** granulaires
- **Routage protégé** selon les rôles utilisateur
- **Gestion de session** automatique

### 📊 Tableau de bord
- **Vue d'ensemble** des statistiques clés
- **Activités récentes** en temps réel
- **Actions rapides** pour les tâches fréquentes
- **Interface responsive** adaptée à tous les écrans

### 🏢 Gestion des entités
- **CRUD complet** pour les entités
- **Filtrage et recherche** avancés
- **Pagination** optimisée
- **Validation** côté client

### 👥 Gestion des administrateurs
- **Suivi des mandats** avec alertes d'expiration
- **Renouvellement automatique** des mandats
- **Historique complet** des modifications
- **Notifications intelligentes**

### 📅 Gestion des sessions
- **Planification** de réunions
- **Gestion des participants**
- **Suivi du statut** des sessions
- **Notifications automatiques**

### 🎨 Interface utilisateur
- **Design moderne** et intuitif
- **Navigation fluide** avec sidebar responsive
- **Composants réutilisables** bien structurés
- **Thème cohérent** sur toute l'application

## 🚀 Installation et configuration

### Prérequis
- Node.js 16+ et npm
- API SGEP en cours d'exécution

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Modifier les variables d'environnement
# Éditer le fichier .env avec les bonnes URLs de l'API

# 4. Démarrer en mode développement
npm run serve

# 5. Build pour la production
npm run build
```

### Configuration

Modifier le fichier `.env` avec vos paramètres :

```env
# Configuration API
VUE_APP_BASE_API_URL=http://localhost:8000/api/v1
VUE_APP_FILE_URL=http://localhost:8000

# Configuration application
VUE_APP_NAME=SGEP
VUE_APP_VERSION=1.0.0
```

## 📁 Structure du projet

```
src/
├── components/           # Composants réutilisables
│   ├── layout/          # Composants de mise en page
│   └── partials/        # Composants partiels
├── views/               # Pages/vues principales
│   ├── auth/           # Pages d'authentification
│   ├── entities/       # Gestion des entités
│   ├── sessions/       # Gestion des sessions
│   ├── board-directors/ # Gestion des administrateurs
│   ├── admin/          # Administration système
│   └── reports/        # Rapports et statistiques
├── router/             # Configuration du routage
├── store/              # État global (Vuex)
│   └── modules/        # Modules Vuex
├── services/           # Services API
├── mixins/             # Mixins réutilisables
└── utils/              # Utilitaires
```

## 🛠️ Technologies utilisées

### Framework principal
- **Vue.js 3** - Framework JavaScript progressif
- **Composition API** - API moderne de Vue.js
- **Vue Router 4** - Routage côté client
- **Vuex 4** - Gestion d'état centralisée

### UI/UX
- **CSS3** avec variables personnalisées
- **Flexbox & Grid** pour les layouts
- **Font Awesome** pour les icônes
- **Design responsive** mobile-first

### Utilitaires
- **Axios** - Client HTTP
- **JWT Decode** - Décodage des tokens JWT
- **Moment.js** - Manipulation des dates
- **Notyf** - Notifications toast
- **SweetAlert2** - Modales et alertes

### Outils de développement
- **Vue CLI** - Outil de build
- **ESLint** - Linter JavaScript
- **Babel** - Transpilation ES6+

## 🎯 Pages principales

### Authentification
- **Login** (`/login`) - Connexion utilisateur
- **Forgot Password** (`/forgot-password`) - Réinitialisation mot de passe

### Tableau de bord
- **Dashboard** (`/dashboard`) - Vue d'ensemble du système

### Gestion des entités
- **Liste** (`/entities`) - Toutes les entités
- **Création** (`/entities/create`) - Nouvelle entité
- **Détails** (`/entities/:id`) - Informations détaillées
- **Modification** (`/entities/:id/edit`) - Édition

### Gestion des sessions
- **Liste** (`/sessions`) - Toutes les sessions
- **Création** (`/sessions/create`) - Nouvelle session
- **Détails** (`/sessions/:id`) - Informations de session
- **Modification** (`/sessions/:id/edit`) - Édition

### Administration
- **Utilisateurs** (`/users`) - Gestion des utilisateurs
- **Rôles** (`/roles`) - Gestion des rôles
- **Permissions** (`/permissions`) - Gestion des permissions
- **Paramètres** (`/settings`) - Configuration système

## 🔧 Scripts disponibles

```bash
# Développement
npm run serve          # Serveur de développement
npm run build          # Build de production
npm run lint           # Vérification du code

# Tests (à implémenter)
npm run test:unit      # Tests unitaires
npm run test:e2e       # Tests end-to-end
```

## 🎨 Personnalisation

### Thème et couleurs
Les couleurs principales sont définies dans `/src/App.vue` :
- **Primaire** : #667eea (bleu)
- **Secondaire** : #2c3e50 (gris foncé)
- **Succès** : #28a745 (vert)
- **Danger** : #dc3545 (rouge)

### Composants
Tous les composants suivent les conventions Vue.js 3 avec la Composition API.

## 🚦 État du projet

### ✅ Fonctionnalités implémentées
- ✅ Structure de base de l'application
- ✅ Système d'authentification
- ✅ Layout responsive avec sidebar
- ✅ Routage avec protection des routes
- ✅ Store Vuex modulaire
- ✅ Services API configurés
- ✅ Pages principales créées

### 🔄 En développement
- 🔄 Formulaires de création/édition
- 🔄 Tests unitaires
- 🔄 Composants réutilisables avancés
- 🔄 Gestion des erreurs globale

### 📋 À faire
- 📋 Tests end-to-end
- 📋 PWA (Progressive Web App)
- 📋 Internationalisation (i18n)
- 📋 Thème sombre

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation de l'API
2. Vérifier les logs du navigateur
3. Contacter l'équipe de développement

## 📄 Licence

Projet privé - Tous droits réservés

### Tags: #RestaurantLeConcept #Frontend #React #Redux #API #Documentation