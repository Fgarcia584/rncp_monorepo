# User Stories - Application PWA RNCP
## Parcours Utilisateurs par Rôle

---

## 📋 Vue d'Ensemble

Ce document décrit les **user stories** de l'application PWA RNCP organisées par rôle utilisateur. Chaque story suit le format standard : **"En tant que [rôle], je veux [fonctionnalité] afin de [bénéfice]"**.

### Rôles Utilisateur Identifiés

| Rôle | Description | Permissions Clés |
|------|-------------|------------------|
| **Administrateur** | Gestion complète du système | Tous les accès + gestion utilisateurs |
| **Technicien Logistique** | Optimisation des livraisons | Stats globales + gestion livraisons |
| **Commerçant** | Création et suivi commandes | Gestion commandes + inventaire |
| **Livreur** | Exécution des livraisons | Gestion livraisons uniquement |

---

## 🔐 User Stories - Authentification & Sécurité

### US-AUTH-001 : Inscription Sécurisée
**En tant qu'utilisateur,** je veux créer un compte avec un mot de passe robuste **afin de** protéger mes données personnelles.

**Critères d'acceptation :**
- [ ] Mot de passe minimum 12 caractères avec critères de complexité
- [ ] Validation en temps réel des critères de sécurité
- [ ] Messages d'aide accessibles pour chaque champ
- [ ] Email de confirmation obligatoire

**Référence implémentation :** `apps/rncp_PWA_front/src/components/auth/RegisterForm.tsx`

### US-AUTH-002 : Connexion Simplifiée
**En tant qu'utilisateur,** je veux me connecter rapidement avec mes identifiants **afin d'** accéder à mon tableau de bord.

**Critères d'acceptation :**
- [ ] Connexion via email/mot de passe
- [ ] Tokens JWT stockés en cookies httpOnly sécurisés
- [ ] Redirection automatique selon le rôle
- [ ] Gestion des erreurs avec messages explicites

**Référence implémentation :** `apps/rncp_PWA_front/src/components/auth/LoginForm.tsx`

### US-AUTH-003 : Gestion de Session
**En tant qu'utilisateur,** je veux que ma session reste active de façon sécurisée **afin de** ne pas avoir à me reconnecter constamment.

**Critères d'acceptation :**
- [ ] Refresh token automatique (7 jours)
- [ ] Access token courte durée (15 minutes)
- [ ] Déconnexion automatique en cas d'inactivité
- [ ] Nettoyage automatique des anciens tokens localStorage

**Référence implémentation :** `apps/rncp_api/src/microservices/auth-service/auth.controller.ts`

---

## 📦 User Stories - Rôle Commerçant

### US-MERCH-001 : Création de Commande
**En tant que commerçant,** je veux créer une nouvelle commande de livraison **afin de** servir mes clients efficacement.

**Critères d'acceptation :**
- [ ] Formulaire de commande avec validation complète
- [ ] Autocomplétion d'adresse avec Google Maps
- [ ] Sélection de créneaux de livraison
- [ ] Calcul automatique de distance et durée estimée
- [ ] Géolocalisation automatique des adresses

**Référence implémentation :** `apps/rncp_PWA_front/src/pages/MerchantDashboard.tsx`

### US-MERCH-002 : Suivi des Commandes
**En tant que commerçant,** je veux suivre l'état de mes commandes en temps réel **afin de** informer mes clients.

**Critères d'acceptation :**
- [ ] Liste des commandes avec statuts colorés
- [ ] Filtrage par statut et date
- [ ] Mise à jour en temps réel des statuts
- [ ] Historique complet des changements d'état

**Référence implémentation :** `apps/rncp_PWA_front/src/store/api/orderApi.ts`

### US-MERCH-003 : Visualisation Cartographique
**En tant que commerçant,** je veux voir mes livraisons sur une carte **afin de** comprendre la répartition géographique.

**Critères d'acceptation :**
- [ ] Carte interactive avec marqueurs de livraison
- [ ] Différenciation visuelle par statut de commande
- [ ] Calcul d'itinéraires optimisés
- [ ] Zoom automatique sur la zone de livraison

**Référence implémentation :** `apps/rncp_PWA_front/src/components/map/MerchantTrackingMap.tsx`

### US-MERCH-004 : Gestion Inventaire
**En tant que commerçant,** je veux gérer mon inventaire de produits **afin de** préparer les commandes efficacement.

**Critères d'acceptation :**
- [ ] Liste des produits avec stock
- [ ] Mise à jour des quantités
- [ ] Alertes de rupture de stock
- [ ] Catégorisation des produits

---

## 🚚 User Stories - Rôle Livreur

### US-DELIV-001 : Consultation Commandes Disponibles
**En tant que livreur,** je veux voir les commandes disponibles près de moi **afin de** optimiser mes trajets.

**Critères d'acceptation :**
- [ ] Liste des commandes non assignées
- [ ] Tri par proximité géographique
- [ ] Informations de distance et durée estimée
- [ ] Détails de priorité et créneaux horaires

**Référence implémentation :** `apps/rncp_PWA_front/src/pages/DeliveryPersonDashboard.tsx`

### US-DELIV-002 : Acceptation de Commandes
**En tant que livreur,** je veux accepter une ou plusieurs commandes **afin de** constituer ma tournée.

**Critères d'acceptation :**
- [ ] Sélection multiple de commandes
- [ ] Calcul d'itinéraire optimisé automatique
- [ ] Estimation du temps total de tournée
- [ ] Validation avant acceptation définitive

**Référence implémentation :** `apps/rncp_PWA_front/src/store/api/orderApi.ts`

### US-DELIV-003 : Navigation Guidée
**En tant que livreur,** je veux être guidé étape par étape dans ma tournée **afin de** livrer efficacement.

**Critères d'acceptation :**
- [ ] Itinéraire optimisé avec navigation turn-by-turn
- [ ] Géolocalisation en temps réel
- [ ] Instructions vocales (si disponible)
- [ ] Recalcul automatique en cas de déviation

**Référence implémentation :** `apps/rncp_PWA_front/src/components/delivery/LeafletRouteMap.tsx`

### US-DELIV-004 : Gestion des Étapes
**En tant que livreur,** je veux marquer le statut de chaque livraison **afin de** tenir informés commerçants et clients.

**Critères d'acceptation :**
- [ ] Marquage "En route vers récupération"
- [ ] Marquage "Sur place - récupération"
- [ ] Marquage "Colis récupéré"
- [ ] Marquage "En route vers livraison"
- [ ] Marquage "Sur place - livraison"
- [ ] Marquage "Livré" avec confirmation

**Référence implémentation :** `apps/rncp_PWA_front/src/components/delivery/DeliveryStepsList.tsx`

### US-DELIV-005 : Mode Offline PWA
**En tant que livreur,** je veux continuer à utiliser l'app sans connexion **afin de** ne pas être bloqué en déplacement.

**Critères d'acceptation :**
- [ ] Cache automatique des données de tournée
- [ ] Fonctionnement offline de la navigation
- [ ] Synchronisation automatique au retour de connexion
- [ ] Indicateur de statut de connexion

**Référence implémentation :** `apps/rncp_PWA_front/src/hooks/useOfflineMode.ts`

---

## 🔧 User Stories - Rôle Technicien Logistique

### US-LOGIS-001 : Vue d'Ensemble des Livraisons
**En tant que technicien logistique,** je veux avoir une vue globale de toutes les livraisons **afin d'** optimiser les flux.

**Critères d'acceptation :**
- [ ] Tableau de bord avec métriques temps réel
- [ ] Statistiques de performance par livreur
- [ ] Indicateurs de retard et problèmes
- [ ] Carte globale avec toutes les tournées actives

### US-LOGIS-002 : Optimisation des Tournées
**En tant que technicien logistique,** je veux réorganiser les tournées en cours **afin d'** améliorer l'efficacité.

**Critères d'acceptation :**
- [ ] Réassignation de commandes entre livreurs
- [ ] Calcul d'itinéraires alternatifs
- [ ] Prévision des temps de livraison
- [ ] Alertes en cas de retard critique

### US-LOGIS-003 : Gestion des Incidents
**En tant que technicien logistique,** je veux traiter les incidents de livraison **afin de** maintenir la qualité de service.

**Critères d'acceptation :**
- [ ] Notifications d'incidents en temps réel
- [ ] Réassignation d'urgence de commandes
- [ ] Communication avec livreurs et commerçants
- [ ] Historique des résolutions d'incidents

### US-LOGIS-004 : Rapports de Performance
**En tant que technicien logistique,** je veux générer des rapports d'activité **afin d'** analyser les performances.

**Critères d'acceptation :**
- [ ] Rapports journaliers/hebdomadaires/mensuels
- [ ] Métriques de temps de livraison
- [ ] Analyse des zones de livraison
- [ ] Export des données en CSV/PDF

---

## ⚙️ User Stories - Rôle Administrateur

### US-ADMIN-001 : Gestion des Utilisateurs
**En tant qu'administrateur,** je veux gérer tous les comptes utilisateur **afin de** maintenir la sécurité du système.

**Critères d'acceptation :**
- [ ] Création/modification/suppression d'utilisateurs
- [ ] Attribution et changement de rôles
- [ ] Activation/désactivation de comptes
- [ ] Réinitialisation de mots de passe

### US-ADMIN-002 : Supervision Globale
**En tant qu'administrateur,** je veux surveiller l'ensemble du système **afin de** garantir son bon fonctionnement.

**Critères d'acceptation :**
- [ ] Métriques système temps réel
- [ ] Logs d'activité et erreurs
- [ ] Monitoring des performances
- [ ] Alertes de sécurité automatiques

**Référence implémentation :** `docs/mesures-securite.md` (Monitoring Sentry)

### US-ADMIN-003 : Configuration Système
**En tant qu'administrateur,** je veux configurer les paramètres globaux **afin d'** adapter l'application aux besoins.

**Critères d'acceptation :**
- [ ] Paramètres de géolocalisation
- [ ] Configuration des créneaux de livraison
- [ ] Gestion des zones de livraison
- [ ] Paramètres de sécurité et de session

### US-ADMIN-004 : Sauvegarde et Maintenance
**En tant qu'administrateur,** je veux effectuer les opérations de maintenance **afin de** préserver l'intégrité des données.

**Critères d'acceptation :**
- [ ] Sauvegarde automatique des données
- [ ] Migration de base de données
- [ ] Nettoyage des logs anciens
- [ ] Mise à jour des composants système

---

## 🎯 User Stories - Fonctionnalités Transversales

### US-TRANS-001 : Accessibilité Universelle
**En tant qu'utilisateur en situation de handicap,** je veux utiliser l'application avec mes technologies d'assistance **afin d'** être autonome.

**Critères d'acceptation :**
- [ ] Navigation complète au clavier
- [ ] Instructions explicites sur les formulaires
- [ ] Messages d'erreur annoncés automatiquement
- [ ] Contraste de couleurs conforme WCAG 2.1 AA
- [ ] Taille des cibles tactiles ≥ 44px

**Référence implémentation :** `docs/accessibilite-numerique.md`

### US-TRANS-002 : Performance Mobile
**En tant qu'utilisateur mobile,** je veux une application rapide et réactive **afin d'** être efficace en déplacement.

**Critères d'acceptation :**
- [ ] Temps de chargement < 3 secondes
- [ ] Fonctionnement fluide sur 3G/4G
- [ ] Cache intelligent des données
- [ ] Mode offline fonctionnel
- [ ] Installation PWA sur écran d'accueil

### US-TRANS-003 : Notifications Push
**En tant qu'utilisateur,** je veux recevoir des notifications importantes **afin d'** être informé en temps réel.

**Critères d'acceptation :**
- [ ] Notifications de changement de statut commande
- [ ] Alertes de nouvelles commandes disponibles
- [ ] Rappels de livraisons programmées
- [ ] Notifications d'urgence système

### US-TRANS-004 : Géolocalisation Précise
**En tant qu'utilisateur mobile,** je veux que ma position soit détectée précisément **afin d'** optimiser les calculs de trajet.

**Critères d'acceptation :**
- [ ] Géolocalisation haute précision (GPS)
- [ ] Gestion des erreurs de permission
- [ ] Fallback sur géolocalisation réseau
- [ ] Mise à jour en temps réel de la position

**Référence implémentation :** `apps/rncp_PWA_front/src/hooks/useGeolocation.ts`

---

## 📊 Matrice de Traçabilité

### Couverture Fonctionnelle par Rôle

| Fonctionnalité | Admin | Technicien | Commerçant | Livreur |
|----------------|-------|------------|------------|---------|
| **Authentification** | ✅ | ✅ | ✅ | ✅ |
| **Gestion Commandes** | ✅ | ❌ | ✅ | ❌ |
| **Gestion Livraisons** | ✅ | ✅ | ❌ | ✅ |
| **Cartographie** | ✅ | ✅ | ✅ | ✅ |
| **Statistiques Globales** | ✅ | ✅ | ❌ | ❌ |
| **Gestion Utilisateurs** | ✅ | ❌ | ❌ | ❌ |
| **Rapports** | ✅ | ✅ | ❌ | ❌ |

### Priorités de Développement

| Epic | Priorité | User Stories | Complexité |
|------|----------|--------------|------------|
| **Authentification & Sécurité** | 🔴 Critique | AUTH-001 à AUTH-003 | Moyenne |
| **Gestion Livraisons** | 🔴 Critique | DELIV-001 à DELIV-005 | Élevée |
| **Gestion Commandes** | 🟡 Élevée | MERCH-001 à MERCH-004 | Moyenne |
| **Administration** | 🟢 Moyenne | ADMIN-001 à ADMIN-004 | Faible |
| **Logistique Avancée** | 🟢 Moyenne | LOGIS-001 à LOGIS-004 | Élevée |
| **Accessibilité** | 🟡 Élevée | TRANS-001 | Moyenne |

---

## ✅ Critères de Validation

### Définition of Done (DoD)

Pour qu'une user story soit considérée comme **terminée**, elle doit respecter :

- [ ] **Code** : Implémentation complète et testée
- [ ] **Tests** : Couverture ≥ 80% + tests E2E
- [ ] **Accessibilité** : Conforme WCAG 2.1 AA niveau critique
- [ ] **Sécurité** : Validation des entrées + authentification
- [ ] **Performance** : Temps de réponse < 500ms
- [ ] **Documentation** : Code documenté + user guide
- [ ] **Review** : Code review validé par 2 développeurs

### Métriques de Succès

- **Satisfaction utilisateur** : Score NPS > 8/10
- **Adoption** : 90% des utilisateurs utilisent les fonctionnalités principales
- **Performance** : 95% des actions < 2 secondes
- **Accessibilité** : 0 blocker critique pour les technologies d'assistance
- **Fiabilité** : Disponibilité > 99.9%

---

## 🎯 Conclusion

Ces **43 user stories** couvrent l'ensemble des parcours utilisateur de l'application PWA RNCP, organisées par rôle métier avec une approche centrée utilisateur. Chaque story est directement liée aux implémentations techniques existantes et respecte les standards d'accessibilité et de sécurité mis en place.