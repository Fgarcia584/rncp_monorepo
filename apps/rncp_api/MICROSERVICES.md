# Architecture Microservices - RNCP API

Cette documentation explique l'architecture microservices mise en place pour l'API RNCP.

## 🏗️ Architecture

### Services déployés

1. **API Gateway** (`rncp-api-gateway`)
    - Port: 3001
    - Point d'entrée principal
    - Routing vers les microservices
    - Health check: `/health`

2. **User Service** (`rncp-user-service`)
    - Port: 3002
    - Gestion des utilisateurs
    - Health check: `/users/health`
    - Endpoints: `/users/*`

3. **Redis** (`redis`)
    - Port: 6379
    - Message broker pour la communication inter-services
    - Cache partagé

4. **PWA Frontend** (`rncp-pwa-front`)
    - Port: 3000
    - Interface utilisateur

## 🚀 Démarrage

### Tous les services

```bash
docker-compose up -d
```

### Services spécifiques

```bash
# API Gateway uniquement
docker-compose up rncp-api-gateway

# User Service uniquement
docker-compose up rncp-user-service

# Avec Redis
docker-compose up rncp-api-gateway rncp-user-service redis
```

## 📡 Endpoints

### API Gateway (Port 3001)

- `GET /` - Hello world
- `GET /health` - Health check
- `GET /users` - Liste des utilisateurs (proxy vers user-service)
- `GET /users/:id` - Détails d'un utilisateur
- `POST /users` - Créer un utilisateur

### User Service (Port 3002)

- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `POST /users` - Créer un utilisateur
- `GET /users/health` - Health check du service

## 🔧 Configuration

### Variables d'environnement

#### API Gateway

```env
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
```

#### User Service

```env
NODE_ENV=production
PORT=3001
SERVICE_NAME=user-service
REDIS_URL=redis://redis:6379
```

## 📊 Monitoring

### Health Checks

Chaque service expose un endpoint de santé :

- API Gateway: `http://localhost:3001/health`
- User Service: `http://localhost:3002/users/health`
- Redis: `redis-cli ping`

### Logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f rncp-api-gateway
docker-compose logs -f rncp-user-service
```

## 🔄 Scalabilité

### Scaling horizontal

```bash
# Scale le user service à 3 instances
docker-compose up --scale rncp-user-service=3

# Scale l'API gateway à 2 instances
docker-compose up --scale rncp-api-gateway=2
```

### Load Balancing

Pour une vraie scalabilité, ajoutez un load balancer (nginx, traefik) devant les services.

## 🛠️ Développement

### Ajouter un nouveau microservice

1. **Créer le module**

```bash
# Dans src/microservices/
mkdir new-service
# Créer: new-service.module.ts, new-service.service.ts, new-service.controller.ts
```

2. **Créer le Dockerfile**

```dockerfile
# Dockerfile.new-service
# Copier le Dockerfile.user-service et adapter le port
```

3. **Ajouter au docker-compose.yml**

```yaml
rncp-new-service:
    build:
        context: ./apps/rncp_api
        dockerfile: Dockerfile.new-service
    ports:
        - '3003:3001'
    environment:
        - NODE_ENV=production
        - PORT=3001
        - SERVICE_NAME=new-service
```

## 🔒 Sécurité

### Bonnes pratiques

- ✅ Utilisateur non-root dans les conteneurs
- ✅ Health checks configurés
- ✅ Variables d'environnement pour la configuration
- ✅ Restart automatique en cas de crash
- ✅ Isolation des services

### À implémenter

- 🔄 Authentification JWT
- 🔄 Rate limiting
- 🔄 CORS configuration
- 🔄 Input validation
- 🔄 Logging centralisé

## 📈 Performance

### Optimisations actuelles

- ✅ Multi-stage builds
- ✅ Cache des dépendances
- ✅ Images Alpine (légères)
- ✅ Health checks
- ✅ Graceful shutdown

### Optimisations futures

- 🔄 Compression gzip
- 🔄 Cache Redis pour les données
- 🔄 CDN pour les assets statiques
- 🔄 Monitoring avec Prometheus/Grafana

## 🐛 Troubleshooting

### Problèmes courants

1. **Service ne démarre pas**

```bash
# Vérifier les logs
docker-compose logs rncp-api-gateway

# Vérifier les dépendances
docker-compose ps
```

2. **Health check échoue**

```bash
# Tester manuellement
curl http://localhost:3001/health
curl http://localhost:3002/users/health
```

3. **Communication inter-services**

```bash
# Vérifier Redis
docker-compose exec redis redis-cli ping
```

### Commandes utiles

```bash
# Rebuild sans cache
docker-compose build --no-cache

# Nettoyer
docker-compose down -v
docker system prune -a

# Vérifier les ressources
docker stats
```
