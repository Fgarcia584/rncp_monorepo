# Docker pour RNCP PWA Frontend

Ce document explique comment conteneuriser et déployer la PWA React avec Docker.

## Structure des fichiers Docker

- `Dockerfile` : Configuration multi-stage optimisée pour build et production
- `vite.config.docker.ts` : Configuration Vite optimisée pour Docker
- `nginx.conf` : Configuration nginx optimisée pour PWA
- `.dockerignore` : Fichiers exclus du contexte Docker
- `docker-compose.yml` : Orchestration des services (à la racine du monorepo)

## Build de l'image

### Build local

```bash
# Depuis le dossier de la PWA
cd apps/rncp_PWA_front
docker build -t rncp-pwa-front .
```

### Build avec docker-compose

```bash
# Depuis la racine du monorepo
docker-compose build rncp-pwa-front
```

### Build local

```bash
# Depuis le dossier de la PWA
cd apps/rncp_PWA_front
docker build -t rncp-pwa-front .
```

## Démarrage des services

### Démarrage de la PWA uniquement

```bash
# Depuis la racine du monorepo
docker-compose up rncp-pwa-front
```

### Démarrage de tous les services

```bash
# Depuis la racine du monorepo
docker-compose up -d
```

## Accès à l'application

- **URL locale** : http://localhost:3000
- **Health check** : http://localhost:3000/health

## Configuration nginx

La configuration nginx inclut :

- **Compression gzip** pour optimiser les performances
- **Cache optimisé** pour les assets statiques
- **Support PWA** avec gestion des service workers
- **Routing SPA** pour React Router
- **Headers de sécurité** pour la production
- **Health check endpoint**

## Variables d'environnement

- `NODE_ENV=production` : Mode production

## Optimisations incluses

1. **Multi-stage build** : Réduction de la taille de l'image finale
2. **Cache des dépendances** : Optimisation des builds
3. **Compression gzip** : Réduction de la bande passante
4. **Cache des assets** : Amélioration des performances
5. **Headers de sécurité** : Protection contre les attaques courantes

## Développement

Pour le développement local sans Docker :

```bash
cd apps/rncp_PWA_front
pnpm install
pnpm dev
```

## Production

Pour déployer en production :

```bash
# Build et démarrage
docker-compose up -d --build

# Logs
docker-compose logs -f rncp-pwa-front

# Arrêt
docker-compose down
```

## Intégration avec le monorepo

Le `docker-compose.yml` à la racine permet d'orchestrer :

- PWA Frontend (port 3000)
- API Backend (port 3001) - à conteneuriser
- Base de données PostgreSQL (port 5432) - optionnel
- Redis (port 6379) - optionnel

## Troubleshooting

### Problèmes courants

1. **Port déjà utilisé** : Vérifiez qu'aucun service n'utilise le port 3000
2. **Build échoue** : Vérifiez que `pnpm-lock.yaml` est présent
3. **Assets non trouvés** : Vérifiez que le build Vite s'est bien déroulé

### Commandes utiles

```bash
# Voir les logs
docker-compose logs rncp-pwa-front

# Rebuild sans cache
docker-compose build --no-cache rncp-pwa-front

# Nettoyer les images
docker system prune -a

# Vérifier les containers
docker-compose ps
```
