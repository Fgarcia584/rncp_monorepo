# 🚀 Guide de déploiement Railway - Backend

## ✅ Corrections healthcheck appliquées

### 🔧 **Configuration Railway simplifiée**
- `healthcheckTimeout` : 600s (10 minutes) au lieu de 300s
- Suppression des options `restartPolicy` qui peuvent causer des conflits
- Endpoint `/health` simplifié pour réponse rapide

### 🏥 **Endpoints healthcheck**
- `GET /health` : Réponse simple `{ status: 'ok' }` (utilisé par Railway)
- `GET /health/detailed` : Informations complètes pour debug

### 🐳 **Dockerfile optimisé**
- Suppression du `HEALTHCHECK` Docker (conflit avec Railway)
- Railway gère le healthcheck via `railway.json`
- Build multi-stage optimisé

## 🚀 **Déploiement pas à pas**

### 1. Préparer le projet
```bash
cd apps/rncp_api
node copy-types.js  # Copier les types
npm run build       # Tester le build local
```

### 2. Déployer sur Railway
```bash
railway login
railway link [your-project-id]
railway up
```

### 3. Variables d'environnement Railway
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=your-secret
# Ajouter autres variables si nécessaire
```

## 🔍 **Debug en cas de problème**

### Logs Railway
```bash
railway logs
```

### Test healthcheck local
```bash
# Démarrer l'app
npm run start:gateway

# Tester healthcheck
curl http://localhost:3001/health
# Devrait retourner: {"status":"ok"}
```

### Problèmes fréquents

**1. Timeout healthcheck**
- ✅ Timeout porté à 600s
- ✅ Endpoint `/health` simplifié
- ✅ Logs de démarrage ajoutés

**2. Port incorrect**
- ✅ Application utilise `process.env.PORT`
- ✅ Fallback sur 3001 si PORT non défini

**3. Build échoue**
- ✅ Script `copy-types.js` dans prebuild
- ✅ Types copiés avant compilation

## 📊 **Configuration finale**

### railway.json
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run start:gateway",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 600
  }
}
```

### Package.json scripts
```json
{
  "prebuild": "node copy-types.js",
  "start:gateway": "node dist/main",
  "healthcheck": "node healthcheck.js"
}
```

Le backend devrait maintenant se déployer correctement sur Railway ! 🎉