# Guide d'Intégration Continue - Projet RNCP Monorepo

## Introduction

Bienvenue dans l'équipe ! Ce document vous explique le processus d'intégration continue (CI/CD) mis en place sur notre projet RNCP. L'intégration continue est un ensemble de pratiques qui permettent d'automatiser les tests, la construction et le déploiement de notre application, garantissant ainsi la qualité du code et la fiabilité des livraisons.

## 📋 Vue d'ensemble du processus

Notre pipeline CI/CD suit une approche structurée en plusieurs étapes :

### 1. **Contrôles locaux** (avant le commit)

- Validation automatique du code
- Tests de formatage et de style
- Vérification des messages de commit

### 2. **Tests d'intégration** (sur les Pull Requests)

- Exécution automatique des tests
- Validation de la compatibilité

### 3. **Construction et publication** (sur master/develop)

- Création des images Docker
- Publication sur le registre de conteneurs

### 4. **Déploiement automatique** (environnements de test et production)

- Déploiement en environnement de test (branche develop)
- Déploiement en production (branche master) avec validation manuelle

## 🔧 Configuration des outils de qualité locaux

### Hooks Git avec Husky

Notre projet utilise **Husky** pour exécuter automatiquement des vérifications avant chaque commit :

#### Pre-commit Hook

```bash
# Fichier: .husky/pre-commit
pnpm lint-staged
```

Ce hook exécute automatiquement :

- **ESLint** : Correction automatique des erreurs de style JavaScript/TypeScript
- **Prettier** : Formatage uniforme du code

#### Commit-msg Hook

```bash
# Fichier: .husky/commit-msg
sh .husky/scripts/check-commit-message.sh $1
```

Ce hook valide que vos messages de commit suivent la **convention Conventional Commits** :

- ✅ `feat: ajouter authentification utilisateur`
- ✅ `fix: corriger le bug de validation`
- ✅ `refactor: réorganiser la structure des services`
- ❌ `ajout fonction login` (non conforme)

### Configuration Lint-staged

```json
{
    "lint-staged": {
        "**/*.{js,ts,tsx}": ["eslint --fix"],
        "**/*": "prettier --write --ignore-unknown"
    }
}
```

Cette configuration garantit que :

- Tous les fichiers JavaScript/TypeScript sont automatiquement corrigés par ESLint
- Tous les fichiers sont formatés avec Prettier

## 🚀 Workflows GitHub Actions

### 1. CI Tests (`ci-tests.yml`)

**Déclenchement** : À chaque Pull Request vers les branches `develop` et `master`

**Étapes** :

1. Installation de pnpm v8 et Node.js v18
2. Installation des dépendances du monorepo
3. Compilation des types partagés
4. Exécution des tests de l'API

```yaml
# Exemple d'exécution
on:
    pull_request:
        branches: [develop]

jobs:
    install-and-test:
        runs-on: ubuntu-latest
        steps:
            - name: Install dependencies
              run: pnpm install
            - name: Run API tests
              run: pnpm run test
```

**Objectif** : S'assurer que votre code n'introduit pas de régressions avant la fusion.

### 4. Gestion des Releases (`release.yml`)

**Déclenchement** : Automatique sur push vers `master`

**Fonctionnalités** :

- Génération automatique de numéros de version (semantic versioning)
- Création de changelogs basés sur les commits
- Publication de releases GitHub
- Utilise **semantic-release** pour automatiser le processus

## 🌟 Bonnes pratiques pour les développeurs

### 1. Workflow de développement recommandé

```bash
# 1. Créer une branche de feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer avec commits fréquents
git add .
git commit -m "feat: ajouter validation email"

# 3. Pousser régulièrement
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une Pull Request vers develop
# 5. Attendre la validation CI avant demander une review
# 6. Merger après approbation
```

### 2. Messages de commit

Suivez la **convention Conventional Commits** :

```bash
# Types principaux
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
refactor: # Refactorisation sans changement fonctionnel
docs:     # Documentation
test:     # Ajout/modification de tests
ci:       # Changements CI/CD
chore:    # Tâches de maintenance

# Exemples complets
git commit -m "feat(auth): ajouter authentification à deux facteurs"
git commit -m "fix(api): corriger validation des emails"
git commit -m "refactor(user): simplifier la logique de création utilisateur"
```

### 3. Gestion des branches

```
master (production)
├── develop (intégration)
│   ├── feature/auth-2fa
│   ├── feature/user-profile
│   └── feature/order-tracking
├── hotfix/security-patch (urgence production)
```

### 4. Résolution des échecs CI

#### Tests qui échouent

```bash
# Lancer les tests localement
pnpm run test

# Corriger les erreurs puis recommit
git add .
git commit -m "fix: corriger les tests unitaires"
```

#### Problèmes de lint

```bash
# Fixer automatiquement les problèmes de style
pnpm run lint --fix

# Ou laisser pre-commit le faire automatiquement
git add .
git commit -m "style: corriger le formatage"
```

#### Build Docker qui échoue

```bash
# Tester le build localement
docker build -f apps/rncp_PWA_front/Dockerfile .

# Vérifier les logs d'erreur dans GitHub Actions
# → Aller dans l'onglet "Actions" du repository
```

## 🚨 Gestion des incidents

## 📊 Monitoring et alertes

### Métriques surveillées

- ✅ Succès/échec des builds
- ⏱️ Temps d'exécution des pipelines
- 🏥 Santé des services déployés
- 📈 Couverture de tests

### Notifications

- 📧 Email automatique en cas d'échec de déploiement production
- 🔔 Notifications GitHub sur les Pull Requests
- 📱 Intégration possible avec Slack/Teams (à configurer)

## 🔐 Sécurité

### Bonnes pratiques sécurisées

- ❌ Jamais de secrets dans le code source
- ✅ Utilisation des variables des services Railway pour les données sensibles
- ✅ Séparation des environnements (test/production)
- ✅ Accès restreint aux environnements de production

## 📚 Ressources supplémentaires

### Documentation technique

- [Conventional Commits](https://www.conventionalcommits.org/fr/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [GitHub Actions](https://docs.github.com/actions)

### Commandes utiles

```bash
# Développement local
pnpm run dev:all-micro        # Démarrer tous les services
pnpm run test                 # Lancer les tests
pnpm run lint                 # Vérifier le code

# Docker local
docker-compose up -d          # Démarrer les services
docker-compose logs -f        # Voir les logs
docker-compose down           # Arrêter les services

# Git
git log --oneline -10         # Voir les derniers commits
git status                    # État des fichiers
git branch -r                 # Branches distantes
```

---
