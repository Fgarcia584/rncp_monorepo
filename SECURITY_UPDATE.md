# Mise à Jour de Sécurité - Mots de Passe Renforcés

## 🔐 Nouvelles Exigences de Mots de Passe

Suite à la mise à jour de sécurité, les mots de passe doivent maintenant respecter les critères suivants :

### Critères Obligatoires

- **Minimum 12 caractères**
- **Au moins 1 lettre majuscule** (A-Z)
- **Au moins 1 lettre minuscule** (a-z)
- **Au moins 1 chiffre** (0-9)
- **Au moins 1 caractère spécial** : `!@#$%^&*()_+-=[]{}|;:,.<>?`

### ✅ Exemples de Mots de Passe Valides

- `MySecureP@ssw0rd123!`
- `SuperAdmin2024#Strong`
- `DeliveryPerson123$`
- `LogisticsTech2024!`

### ❌ Exemples de Mots de Passe Non Valides

- `password123` (trop court, pas de majuscule ni caractère spécial)
- `PASSWORD123!` (pas de minuscule)
- `MyPassword!` (pas de chiffre)
- `MyPassword123` (pas de caractère spécial)

## 🔄 Migration des Comptes Existants

### Comptes de Test/Développement

Les scripts de seeding ont été mis à jour avec les nouveaux mots de passe :

| Compte     | Email                 | Nouveau Mot de Passe |
| ---------- | --------------------- | -------------------- |
| Admin      | `admin@rncp.com`      | `SecurePass123!`     |
| Commerçant | `merchant@rncp.com`   | `SecurePass123!`     |
| Livreur    | `livreur@rncp.com`    | `SecurePass123!`     |
| Technicien | `technicien@rncp.com` | `SecurePass123!`     |

### Comptes de Production

⚠️ **IMPORTANT** : Les utilisateurs existants avec des mots de passe faibles devront mettre à jour leur mot de passe lors de leur prochaine connexion.

## 🛠️ Détails Techniques

### Validation Backend

- Nouvelle classe `IsStrongPassword` dans `/src/common/validators/password.validator.ts`
- Intégrée dans les DTOs d'authentification
- Messages d'erreur détaillés pour guider l'utilisateur

### Hachage Renforcé

- Utilisation de bcrypt avec **12 rounds** (au lieu de 10)
- Amélioration de la sécurité contre les attaques par force brute

### Tests

- Tests unitaires complets pour le validator
- Validation de tous les critères de complexité
- Vérification des caractères spéciaux acceptés

## 📋 Actions Recommandées

### Pour les Développeurs

1. Mettre à jour vos mots de passe de test locaux
2. Utiliser les nouveaux mots de passe des scripts de seeding
3. Vérifier que les nouveaux comptes respectent les exigences

### Pour les Administrateurs

1. Informer les utilisateurs des nouvelles exigences
2. Mettre en place une politique de renouvellement de mots de passe
3. Surveiller les tentatives de connexion avec des mots de passe faibles

### Pour les Utilisateurs

1. Créer un nouveau mot de passe respectant les critères
2. Utiliser un gestionnaire de mots de passe si possible
3. Ne pas réutiliser d'anciens mots de passe

## 🔍 Validation en Temps Réel

L'API retourne maintenant des messages d'erreur détaillés lors de la création de compte :

```json
{
    "statusCode": 400,
    "message": [
        "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    ],
    "error": "Bad Request"
}
```

Cette mise à jour améliore significativement la sécurité de la plateforme en empêchant l'utilisation de mots de passe faibles, réduisant ainsi les risques d'attaques par force brute et de compromission de comptes.
