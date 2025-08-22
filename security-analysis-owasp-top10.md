# Analyse de Sécurité OWASP Top 10 - Projet RNCP

## 📋 Résumé Exécutif

Cette analyse examine le projet RNCP (monorepo avec frontend React PWA et backend NestJS) selon les critères du **Top 10 OWASP 2021**. Le projet présente une architecture sécurisée globalement mais comporte **4 vulnérabilités critiques** et plusieurs points d'amélioration.

**Score de Sécurité Global : 6.5/10**

---

## 🔴 Vulnérabilités Critiques Identifiées

### 1. **A02 - Cryptographic Failures** : JWT Secret Hardcodé

**Impact :** Critique ⚠️  
**Fichiers concernés :**

- `apps/rncp_api/railway.toml` (ligne 12)
- `apps/rncp_api/src/microservices/auth-service/strategies/jwt.strategy.ts` (ligne 11)

```toml
# railway.toml - VULNÉRABILITÉ CRITIQUE
JWT_SECRET = "your-super-secret-jwt-key-for-production"
```

```typescript
// jwt.strategy.ts - Fallback non sécurisé
secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
```

**Risque :** N'importe qui ayant accès au dépôt peut compromettre tous les tokens JWT.

**Recommandation :**

- Utiliser uniquement des variables d'environnement
- Générer un secret fort (256 bits minimum)
- Ne jamais commiter de secrets dans le code

---

### 2. **A05 - Security Misconfiguration** : Stockage Insécurisé des Tokens

**Impact :** Critique ⚠️  
**Fichier :** `apps/rncp_PWA_front/src/hooks/useAuth.ts` (lignes 45-46)

```typescript
// Stockage vulnérable aux attaques XSS
localStorage.setItem('token', result.accessToken);
localStorage.setItem('refreshToken', result.refreshToken);
```

**Risque :** Les tokens sont vulnérables aux attaques XSS et persistent indéfiniment.

**Recommandation :**

- Utiliser des cookies httpOnly sécurisés
- Implémenter une stratégie de stockage sécurisée côté serveur

---

### 3. **A01 - Broken Access Control** : Points de Terminaison Debug Exposés

**Impact :** Critique ⚠️  
**Fichier :** `apps/rncp_api/src/microservices/user-service/user.controller.ts` (lignes 85-89)

```typescript
@Public() // Bypass complet de l'authentification !
@Get('debug-test')
debugTest(): { message: string } {
    return { message: 'Debug endpoint working - guard bypassed!' };
}
```

**Risque :** Endpoints de debug accessibles en production sans authentification.

**Recommandation :**

- Supprimer tous les endpoints de debug du code de production
- Utiliser des profils de compilation conditionnels

---

### 4. **A07 - Identification and Authentication Failures** : Exigences de Mot de Passe Faibles

**Impact :** Élevé ⚠️  
**Fichier :** `apps/rncp_api/src/microservices/auth-service/dto/auth.dto.ts` (lignes 17-19)

```typescript
@IsString()
@MinLength(6) // Trop faible pour la production
password: string;
```

**Risque :** Mots de passe facilement cassables par force brute.

**Recommandation :**

- Minimum 12 caractères
- Exiger majuscules, minuscules, chiffres et caractères spéciaux

---

## 🟡 Vulnérabilités Moyennes

### 5. **A05 - Security Misconfiguration** : Absence de Limitation de Débit

**Impact :** Moyen  
**Problème :** Aucune limitation de débit implémentée dans l'application.

**Risque :** Vulnérabilité aux attaques par force brute et déni de service.

**Recommandation :** Implémenter `@nestjs/throttler`

---

### 6. **A05 - Security Misconfiguration** : En-têtes de Sécurité Incomplets

**Impact :** Moyen  
**Fichier :** `apps/rncp_PWA_front/nginx.conf`

**En-têtes manquants :**

- Content-Security-Policy
- Strict-Transport-Security
- Permissions-Policy

**Recommandation :** Ajouter tous les en-têtes de sécurité essentiels.

---

### 7. **A09 - Security Logging and Monitoring Failures** : Divulgation d'Information

**Impact :** Moyen  
**Fichier :** `apps/rncp_api/src/microservices/user-service/user.controller.ts`

```typescript
throw new Error('Forbidden: You can only update your own profile');
```

**Risque :** Utilisation d'`Error` générique peut exposer des stack traces.

**Recommandation :** Utiliser des exceptions HTTP spécifiques de NestJS.

---

## 🟢 Bonnes Pratiques Identifiées

### ✅ Hachage Sécurisé des Mots de Passe

**Fichier :** `apps/rncp_api/src/microservices/auth-service/auth.service.ts`

```typescript
const hashedPassword = await bcrypt.hash(password, 12); // Excellente pratique
```

### ✅ Validation Globale des Entrées

**Fichier :** `apps/rncp_api/src/auth-main.ts`

```typescript
app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true, // Filtre les propriétés non définies
        forbidNonWhitelisted: true, // Rejette les données non attendues
        transform: true, // Transformation automatique des types
    }),
);
```

### ✅ Prévention de l'Injection SQL

**Fichier :** `apps/rncp_api/src/microservices/order-service/order.service.ts`

```typescript
queryBuilder.andWhere('order.status = :status', {
    status: filters.status, // Requêtes paramétrées avec TypeORM
});
```

### ✅ Exclusion des Mots de Passe des Réponses

**Fichier :** `apps/rncp_api/src/entities/user.entity.ts`

```typescript
@Column()
@Exclude() // Empêche la sérialisation du mot de passe
password: string;
```

### ✅ Contrôle d'Accès Basé sur les Rôles (RBAC)

**Fichier :** `apps/rncp_api/src/common/guards/roles.guard.ts`

```typescript
// Les admins ont accès à tout
if (user.role === UserRole.ADMIN) {
    return true;
}
return requiredRoles.some((role) => user.role === role);
```

### ✅ Sécurité des Conteneurs

**Fichier :** `apps/rncp_api/Dockerfile.auth-service.local`

```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs # Exécution en tant qu'utilisateur non-root
```

---

## 📊 Évaluation par Catégorie OWASP

| Vulnérabilité OWASP                 | Status        | Risque   | Notes                             |
| ----------------------------------- | ------------- | -------- | --------------------------------- |
| **A01** - Broken Access Control     | ⚠️ Vulnérable | Critique | Endpoints debug exposés           |
| **A02** - Cryptographic Failures    | ⚠️ Vulnérable | Critique | JWT secrets hardcodés             |
| **A03** - Injection                 | ✅ Protégé    | Faible   | TypeORM + validation globale      |
| **A04** - Insecure Design           | ✅ Acceptable | Moyen    | Architecture microservices solide |
| **A05** - Security Misconfiguration | ⚠️ Vulnérable | Élevé    | Tokens localStorage + en-têtes    |
| **A06** - Vulnerable Components     | ✅ Acceptable | Moyen    | Dépendances récentes              |
| **A07** - Auth Failures             | ⚠️ Vulnérable | Élevé    | Mots de passe faibles             |
| **A08** - Integrity Failures        | ✅ Acceptable | Moyen    | Build process sécurisé            |
| **A09** - Logging Failures          | ⚠️ Partiel    | Moyen    | Logging basique présent           |
| **A10** - SSRF                      | ✅ Protégé    | Faible   | Pas d'endpoints SSRF identifiés   |

---

## 🚀 Plan d'Action Prioritaire

### 🔥 Actions Immédiates (24-48h)

1. **Supprimer tous les secrets hardcodés**
    - Générer un JWT_SECRET fort en variable d'environnement
    - Audit complet des fichiers de configuration

2. **Supprimer les endpoints de debug**
    - Recherche globale de `@Public()` et `debug`
    - Mise en place d'un processus de revue de code

3. **Sécuriser le stockage des tokens**
    - Implémenter des cookies httpOnly
    - Ajouter des flags Secure et SameSite

### 🔧 Actions Haute Priorité (1-2 semaines)

4. **Renforcer les mots de passe**
    - Minimum 12 caractères + complexité
    - Implémenter des règles de validation avancées

5. **Ajouter la limitation de débit**

    ```bash
    npm install @nestjs/throttler
    ```

6. **Compléter les en-têtes de sécurité**
    - Content-Security-Policy strict
    - HSTS avec preload

### 📈 Actions Moyennes (2-4 semaines)

7. **Améliorer le logging de sécurité**
    - Logs d'authentification et d'autorisation
    - Monitoring des tentatives d'intrusion

8. **Tests de sécurité automatisés**
    - Intégration d'outils comme Snyk
    - Tests de pénétration réguliers

---

## 🔍 Méthodologie d'Analyse

Cette analyse a été réalisée par :

1. **Revue de code statique** de l'ensemble du monorepo
2. **Analyse des configurations** Docker, nginx, Railway
3. **Vérification des dépendances** package.json
4. **Évaluation de l'architecture** microservices NestJS
5. **Test des mécanismes d'authentification** et d'autorisation

---

## 📚 Ressources et Références

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Container Security Guidelines](https://owasp.org/www-project-container-security/)

---

**Rapport généré le :** 22 août 2025  
**Analysé par :** Claude Code Security Analysis  
**Version du projet :** Branche `develop` (commit `dd5f057`)
