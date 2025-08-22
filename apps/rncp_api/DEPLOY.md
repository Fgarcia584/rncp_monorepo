# Déploiement API RNCP sur Railway

## Solution au problème @rncp/types

Le package `@rncp/types` est un package interne au monorepo qui ne peut pas être résolu sur Railway. 

### Modifications effectuées :

1. **Script de copie automatique** (`copy-types.js`) :
   - Copie les types depuis `../../tools/types` vers `./src/types`
   - S'exécute automatiquement avant chaque build

2. **Configuration TypeScript mise à jour** :
   - `tsconfig.json` : `"@rncp/types": ["./src/types"]`
   - Les imports `@rncp/types` pointent maintenant vers le dossier local

3. **Scripts package.json** :
   - `postinstall` : Copie les types après installation des dépendances
   - `prebuild` : Copie les types avant le build

### Commandes de déploiement Railway :

```bash
# Depuis le dossier apps/rncp_api
railway login
railway link [your-project-id]
railway up
```

### Variables d'environnement requises :

```env
NODE_ENV=production
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
```

### Services à déployer séparément :

- **API Gateway** (port 3001) - Service principal
- **Auth Service** (port 3002) 
- **User Service** (port 3002)
- **Order Service** (port 3003)
- **Geo Service** (port 3004)

Le build copiera automatiquement les types et les erreurs `Cannot find module '@rncp/types'` seront résolues.