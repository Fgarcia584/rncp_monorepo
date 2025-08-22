# 🐛 Sentry Integration Guide

Cette documentation explique comment configurer et utiliser Sentry pour le monitoring d'erreurs et de performances dans le projet RNCP.

## 📋 Prérequis

1. **Compte Sentry** : Créez un compte sur [sentry.io](https://sentry.io)
2. **Projets Sentry** : Créez des projets séparés pour le frontend et le backend
3. **DSN Keys** : Récupérez les clés DSN pour chaque projet

## 🔧 Configuration

### 1. Variables d'environnement

#### Frontend (`apps/rncp_PWA_front/.env`)

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
VITE_ENVIRONMENT=development
VITE_APP_VERSION=1.0.0

# Pour l'upload des source maps (production uniquement)
SENTRY_ORG=your-org-name
SENTRY_PROJECT=rncp-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

#### Backend (`apps/rncp_api/.env`)

```env
# Sentry Configuration
SENTRY_DSN=https://def456@o123456.ingest.sentry.io/654321
NODE_ENV=development
APP_VERSION=1.0.0
```

### 2. Récupération des clés Sentry

1. **DSN** : Projet → Settings → Client Keys (DSN)
2. **Auth Token** : User Settings → Auth Tokens → Create New Token
3. **Org/Project** : Visible dans l'URL de votre projet Sentry

## 🚀 Fonctionnalités intégrées

### Frontend (React PWA)

#### ✅ Configuré automatiquement

- **Error Boundary** : Capture automatique des erreurs React
- **Performance Monitoring** : Mesure des Core Web Vitals
- **Session Replay** : Enregistrement des sessions (erreurs uniquement en prod)
- **API Error Tracking** : Capture des erreurs d'API via Redux
- **User Context** : Informations utilisateur automatiques lors de la connexion
- **Source Maps** : Upload automatique en production

#### 🛠️ Utilisation manuelle

```typescript
import { Sentry } from './sentry';

// Capturer une erreur
Sentry.captureException(new Error('Something went wrong'));

// Capturer un message
Sentry.captureMessage('User performed action', 'info');

// Ajouter un breadcrumb
Sentry.addBreadcrumb({
    message: 'User clicked button',
    category: 'ui',
    level: 'info',
});

// Définir le contexte utilisateur
Sentry.setUser({
    id: '123',
    email: 'user@example.com',
});
```

### Backend (NestJS)

#### ✅ Configuré automatiquement

- **Global Exception Filter** : Capture automatique des erreurs HTTP
- **Performance Interceptor** : Monitoring des requêtes HTTP
- **Request Context** : Informations sur les requêtes (headers, params, etc.)
- **User Context** : Informations utilisateur depuis les tokens JWT
- **Error Filtering** : Filtrage des erreurs non pertinentes

#### 🛠️ Utilisation manuelle

```typescript
import { Sentry } from '../sentry/sentry.config';

// Dans un service ou contrôleur
Sentry.captureException(error);
Sentry.captureMessage('Database operation completed', 'info');

// Ajouter du contexte
Sentry.setContext('database', {
    query: 'SELECT * FROM users',
    duration: 150,
});
```

## 🧪 Tests en développement

### Frontend

Un composant de test est disponible en bas à droite en mode développement :

- **Test Message** : Envoie un message à Sentry
- **Test Error** : Envoie une erreur à Sentry
- **Test JS Error** : Déclenche une erreur captée par l'Error Boundary
- **Test Async Error** : Teste les erreurs asynchrones
- **Test Breadcrumb** : Ajoute un breadcrumb

### Backend

Endpoints de test disponibles en développement :

- `GET /sentry/test-message` : Test de message
- `GET /sentry/test-error` : Test d'erreur
- `GET /sentry/test-exception` : Test d'exception HTTP
- `POST /sentry/test-async-error` : Test d'erreur asynchrone
- `GET /sentry/test-breadcrumb` : Test de breadcrumb

## 📊 Monitoring et alertes

### Métriques importantes à surveiller

#### Frontend

- **Error Rate** : Taux d'erreurs JavaScript
- **Core Web Vitals** : LCP, FID, CLS
- **API Failures** : Échecs des appels d'API
- **Authentication Errors** : Problèmes de connexion

#### Backend

- **HTTP 5xx Errors** : Erreurs serveur
- **Response Time** : Temps de réponse des API
- **Database Errors** : Erreurs de base de données
- **Authentication Failures** : Échecs d'authentification

### Configuration des alertes recommandée

1. **Error Rate** > 1% sur 5 minutes
2. **Response Time** > 1000ms sur 5 minutes
3. **Nouvelle erreur** non vue auparavant
4. **Pic d'erreurs** : +500% par rapport à la normale

## 🔒 Sécurité et confidentialité

### Données automatiquement filtrées

- **Headers d'authentification** : Authorization, Cookie, X-API-Key
- **Erreurs de validation** : Ne remontent pas à Sentry
- **Erreurs réseau attendues** : ECONNRESET, ETIMEDOUT
- **Erreurs 404 attendues** : favicon.ico, robots.txt

### Configuration RGPD

- **Masquage des données** : Texte et média masqués en production (Session Replay)
- **Filtrage PII** : Données personnelles exclues automatiquement
- **Rétention** : Configurez la durée de rétention dans Sentry

## 📈 Releases et déploiements

### Configuration automatique

- **Release Tracking** : Utilise `APP_VERSION` / `VITE_APP_VERSION`
- **Source Maps** : Upload automatique en production (frontend)
- **Deploy Notifications** : Création automatique des releases

### Commandes utiles

```bash
# Build avec upload des source maps (frontend)
pnpm build

# Vérifier la version actuelle
echo $VITE_APP_VERSION

# Créer une nouvelle release manuellement
sentry-cli releases new $VITE_APP_VERSION
sentry-cli releases finalize $VITE_APP_VERSION
```

## 🐛 Dépannage

### Problèmes courants

#### "Sentry DSN not provided"

- Vérifiez que la variable d'environnement est correctement définie
- Redémarrez le serveur de développement

#### "Source maps not uploading"

- Vérifiez `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- Vérifiez que le build génère des source maps (`sourcemap: true`)

#### "No errors in Sentry"

- Utilisez les endpoints/composants de test en développement
- Vérifiez la console pour les messages d'initialisation Sentry

### Logs utiles

```bash
# Frontend (console du navigateur)
"Sentry initialized for environment: development"

# Backend (logs serveur)
"Sentry initialized for environment: development"
"🔐 Auth Service is running on port 3001"
```

## 📚 Resources

- [Documentation Sentry](https://docs.sentry.io/)
- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Monitoring](https://docs.sentry.io/product/issues/)
