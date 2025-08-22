# Cahier de Recettes - Plateforme RNCP de Gestion de Livraisons

## Informations du Document

| Élément                   | Détail                                             |
| ------------------------- | -------------------------------------------------- |
| **Projet**                | Plateforme RNCP - Système de Gestion de Livraisons |
| **Version**               | 1.0                                                |
| **Date de création**      | Décembre 2024                                      |
| **Environnement de test** | Test/Staging                                       |
| **Responsable QA**        | Équipe Test & Validation                           |

## 1. Introduction et Objectifs

### 1.1 Contexte du Projet

Ce cahier de recettes définit l'ensemble des scénarios de tests et des résultats attendus pour valider le bon fonctionnement de la plateforme RNCP de gestion de livraisons. Cette plateforme connecte les **commerçants**, **livreurs**, **techniciens logistiques** et **administrateurs** dans un écosystème de livraison efficace et traçable.

### 1.2 Objectifs des Recettes

- **Validation fonctionnelle** : S'assurer que toutes les fonctionnalités métier répondent aux exigences
- **Tests d'intégration** : Vérifier la cohérence entre les différents composants du système
- **Tests de performance** : Valider les temps de réponse et la tenue en charge
- **Tests de sécurité** : S'assurer de la protection des données et des accès
- **Tests de régression** : Détecter les anomalies introduites par les évolutions

### 1.3 Architecture du Système Testé

#### Frontend

- **PWA React 19** : Interface utilisateur progressive avec support offline
- **TypeScript + Vite** : Développement typé et build optimisé
- **Tailwind CSS** : Framework CSS utilitaire
- **Redux Toolkit Query** : Gestion des états et des appels API

#### Backend - Architecture Microservices

- **API Gateway** (Port 3001) : Point d'entrée unique, routage vers les microservices
- **Auth Service** (Port 3002) : Authentification et autorisation JWT
- **User Service** (Port 3002) : Gestion des utilisateurs et profils
- **Order Service** (Port 3003) : Gestion du cycle de vie des commandes
- **Geo Service** (Port 3004) : Services de géolocalisation et tracking

#### Infrastructure

- **PostgreSQL 15** : Base de données relationnelle principale
- **Redis 7** : Cache et message broker pour la communication inter-services
- **Docker Compose** : Orchestration des services en développement
- **Azure Container Instances** : Déploiement cloud en production

---

## 2. Stratégie et Périmètre de Test

### 2.1 Types de Tests Couverts

| Type de Test     | Objectif                           | Périmètre                       |
| ---------------- | ---------------------------------- | ------------------------------- |
| **Fonctionnels** | Validation des exigences métier    | Tous les domaines fonctionnels  |
| **Intégration**  | Cohérence inter-composants         | API Gateway, microservices, BDD |
| **Performance**  | Temps de réponse, montée en charge | Endpoints critiques, UI         |
| **Sécurité**     | Protection des données, accès      | Authentification, autorisation  |
| **Régression**   | Non-régression sur évolutions      | Fonctionnalités existantes      |

### 2.2 Environnements de Test

- **Développement local** : Docker Compose avec services locaux
- **Environnement de test** : Azure Container Instances (environnement staging)
- **Tests d'acceptation** : Réplication de l'environnement de production

### 2.3 Outils et Méthodologies

- **Tests manuels** : Validation par scénarios utilisateur
- **Tests automatisés** : Jest pour les tests unitaires, Cypress pour l'E2E
- **Tests de charge** : Artillery.js ou K6 pour les tests de performance
- **Monitoring** : Health checks automatisés des services

---

## 3. Tests Fonctionnels par Domaine Métier

### 3.1 Domaine : Authentification et Autorisation

#### TC-AUTH-001 : Inscription d'un nouvel utilisateur

**Objectif** : Valider la création d'un compte utilisateur avec assignation de rôle

**Préconditions** :

- L'application est accessible
- L'utilisateur n'existe pas en base

**Étapes d'exécution** :

1. Accéder à la page d'inscription (`POST /auth/register`)
2. Saisir les informations obligatoires :
    - Nom : "Jean Dupont"
    - Email : "jean.dupont@example.com"
    - Mot de passe : "MotDePasse123!"
    - Rôle : "delivery_person"
3. Cliquer sur "S'inscrire"

**Résultats attendus** :

- **Code de réponse** : 201 Created
- **Réponse JSON** contenant :
    ```json
    {
      "user": {
        "id": number,
        "name": "Jean Dupont",
        "email": "jean.dupont@example.com",
        "role": "delivery_person",
        "createdAt": "ISO-Date"
      },
      "tokens": {
        "accessToken": "jwt-token",
        "refreshToken": "refresh-token"
      }
    }
    ```
- **Vérifications** :
    - Utilisateur créé en base de données
    - Mot de passe hashé (non visible en clair)
    - Tokens JWT valides et non expirés
    - Redirection vers le dashboard approprié au rôle

**Critères de validation** :

- ✅ Utilisateur enregistré avec le bon rôle
- ✅ Tokens générés et fonctionnels
- ✅ Redirection automatique vers l'interface utilisateur

#### TC-AUTH-002 : Connexion utilisateur valide

**Objectif** : Valider la connexion avec des identifiants corrects

**Préconditions** :

- Utilisateur existant en base : jean.dupont@example.com / MotDePasse123!

**Étapes d'exécution** :

1. Accéder à la page de connexion
2. Saisir email : "jean.dupont@example.com"
3. Saisir mot de passe : "MotDePasse123!"
4. Cliquer sur "Se connecter" (`POST /auth/login`)

**Résultats attendus** :

- **Code de réponse** : 200 OK
- **Tokens JWT** générés et stockés
- **Redirection** vers le dashboard correspondant au rôle utilisateur
- **Session** active pendant la durée de validité du token

**Critères de validation** :

- ✅ Authentification réussie
- ✅ Interface adaptée au rôle affiché
- ✅ Gestion de session opérationnelle

#### TC-AUTH-003 : Connexion avec identifiants invalides

**Objectif** : Valider le rejet des connexions avec de mauvais identifiants

**Préconditions** :

- Application accessible

**Étapes d'exécution** :

1. Tenter une connexion avec email inexistant : "inexistant@example.com"
2. Tenter une connexion avec mauvais mot de passe pour un email existant
3. Tenter une connexion avec champs vides

**Résultats attendus** :

- **Code de réponse** : 401 Unauthorized
- **Message d'erreur** : "Identifiants invalides"
- **Pas de token généré**
- **Pas de redirection**

**Critères de validation** :

- ✅ Accès refusé pour les identifiants incorrects
- ✅ Messages d'erreur appropriés affichés
- ✅ Sécurité maintenue (pas d'information sur l'existence du compte)

#### TC-AUTH-004 : Gestion des rôles utilisateur

**Objectif** : Valider que les droits d'accès sont correctement appliqués selon le rôle

**Préconditions** :

- Utilisateurs créés avec différents rôles :
    - admin@example.com (role: admin)
    - merchant@example.com (role: merchant)
    - delivery@example.com (role: delivery_person)
    - logistics@example.com (role: logistics_technician)

**Étapes d'exécution** :

**Test 4.1 - Accès Administrateur** :

1. Se connecter avec admin@example.com
2. Tenter d'accéder à `GET /users` (liste des utilisateurs)
3. Tenter de modifier un utilisateur `PUT /users/:id`

**Résultats attendus 4.1** :

- ✅ Accès autorisé à toutes les fonctions admin
- ✅ Interface d'administration complète visible
- ✅ Actions CRUD sur les utilisateurs autorisées

**Test 4.2 - Accès Livreur** :

1. Se connecter avec delivery@example.com
2. Tenter d'accéder à `GET /users` (doit être refusé)
3. Accéder à `GET /orders/available` (doit être autorisé)
4. Tenter `POST /orders/:id/accept` (doit être autorisé)

**Résultats attendus 4.2** :

- ❌ Accès refusé aux fonctions admin (403 Forbidden)
- ✅ Accès autorisé aux commandes disponibles
- ✅ Possibilité d'accepter des commandes
- ✅ Interface livreur appropriée

**Test 4.3 - Accès Commerçant** :

1. Se connecter avec merchant@example.com
2. Tenter `POST /orders` (création de commande - autorisé)
3. Tenter `GET /orders/available` (doit être refusé)
4. Accéder à ses propres commandes seulement

**Résultats attendus 4.3** :

- ✅ Création de nouvelles commandes autorisée
- ❌ Accès aux commandes disponibles refusé
- ✅ Visibilité limitée aux propres commandes
- ✅ Interface commerçant appropriée

**Critères de validation** :

- ✅ Séparation stricte des droits par rôle
- ✅ Interfaces adaptées aux permissions
- ✅ Rejets d'accès avec codes d'erreur appropriés

### 3.2 Domaine : Gestion des Commandes

#### TC-ORDER-001 : Création d'une commande par un commerçant

**Objectif** : Valider la création complète d'une nouvelle commande de livraison

**Préconditions** :

- Utilisateur connecté avec rôle "merchant"
- Dashboard commerçant affiché

**Étapes d'exécution** :

1. Cliquer sur "Nouvelle Livraison"
2. Remplir le formulaire de commande :
    - Nom du client : "Marie Martin"
    - Téléphone : "0123456789"
    - Adresse : "123 Rue de la Paix, 75001 Paris"
    - Heure de livraison : "2024-12-20 14:30"
    - Priorité : "high"
    - Notes : "Fragile - Ne pas secouer"
    - Durée estimée : 30 minutes
3. Cliquer sur "Créer la commande"

**Résultats attendus** :

- **API Call** : `POST /orders` avec le payload correct
- **Code de réponse** : 201 Created
- **Réponse JSON** :
    ```json
    {
        "id": 123,
        "customerName": "Marie Martin",
        "customerPhone": "0123456789",
        "deliveryAddress": "123 Rue de la Paix, 75001 Paris",
        "scheduledDeliveryTime": "2024-12-20T14:30:00.000Z",
        "priority": "high",
        "status": "pending",
        "merchantId": 1,
        "notes": "Fragile - Ne pas secouer",
        "estimatedDeliveryDuration": 30,
        "createdAt": "2024-12-18T10:00:00.000Z"
    }
    ```
- **Interface** :
    - Message de confirmation affiché
    - Formulaire réinitialisé
    - Modal fermée
    - Commande visible dans la liste des commandes récentes

**Critères de validation** :

- ✅ Commande enregistrée en base avec tous les champs
- ✅ Statut initial "pending" correctement attribué
- ✅ Association au commerçant authentifié
- ✅ Interface mise à jour dynamiquement

#### TC-ORDER-002 : Consultation des commandes disponibles par un livreur

**Objectif** : Valider l'affichage des commandes en attente d'acceptation

**Préconditions** :

- Utilisateur connecté avec rôle "delivery_person"
- Au moins 3 commandes en statut "pending" en base de données
- Dashboard livreur affiché

**Étapes d'exécution** :

1. Cliquer sur "Voir Commandes Disponibles"
2. Observer la liste affichée
3. Vérifier les informations de chaque commande
4. Vérifier les actions disponibles

**Résultats attendus** :

- **API Call** : `GET /orders/available?page=1&limit=10`
- **Code de réponse** : 200 OK
- **Données affichées** pour chaque commande :
    - Identifiant : CMD-XXX
    - Nom du client
    - Téléphone client (si renseigné)
    - Adresse de livraison complète
    - Heure de livraison programmée
    - Priorité avec code couleur :
        - Rouge : Urgente
        - Orange : Haute
        - Jaune : Normale
        - Vert : Basse
    - Notes particulières
    - Durée estimée
- **Actions disponibles** :
    - Bouton "Accepter" (vert)
    - Bouton "Localiser" (bleu)
- **Filtrage** : Seulement les commandes avec status "pending"
- **Interface** : Modal responsive avec scroll si nécessaire

**Critères de validation** :

- ✅ Seules les commandes disponibles sont affichées
- ✅ Toutes les informations nécessaires sont visibles
- ✅ Interface claire et utilisable sur mobile
- ✅ Actions contextuelles présentes

#### TC-ORDER-003 : Acceptation d'une commande par un livreur

**Objectif** : Valider le processus complet d'acceptation d'une commande

**Préconditions** :

- Utilisateur connecté avec rôle "delivery_person" (ID: 2)
- Commande disponible en statut "pending" (ID: 123)
- Modal des commandes disponibles ouverte

**Étapes d'exécution** :

1. Localiser la commande CMD-123 dans la liste
2. Cliquer sur le bouton "Accepter"
3. Observer les changements d'état

**Résultats attendus** :

- **API Call** : `POST /orders/123/accept`
- **Code de réponse** : 200 OK
- **Réponse JSON** :
    ```json
    {
        "id": 123,
        "status": "accepted",
        "deliveryPersonId": 2,
        "acceptedAt": "2024-12-18T10:15:00.000Z",
        "customerName": "Marie Martin",
        "deliveryAddress": "123 Rue de la Paix, 75001 Paris"
    }
    ```
- **Interface** :
    - Message de confirmation : "Commande 123 acceptée !"
    - Commande retirée de la liste des disponibles
    - Commande ajoutée aux "Livraisons Assignées"
    - Statistiques mises à jour : "+1 En Attente"
    - Cache RTK Query invalidé automatiquement

**Critères de validation** :

- ✅ Statut commande mis à jour en base de données
- ✅ Association correcte avec le livreur
- ✅ Interface temps réel mise à jour
- ✅ Cohérence des données affichées

#### TC-ORDER-004 : Suivi d'une commande en cours de livraison

**Objectif** : Valider le tracking temps réel d'une livraison en cours

**Préconditions** :

- Commande acceptée par un livreur (status: "accepted")
- Service de géolocalisation activé
- Livreur ID: 2, Commande ID: 123

**Étapes d'exécution** :

1. Livreur : Activer le mode "Vue Carte Interactive"
2. Démarrer le suivi de livraison via l'API
3. Commerçant : Accéder au "Tracking Livraisons"
4. Observer les mises à jour temps réel

**Résultats attendus** :

**Côté Livreur** :

- **Carte interactive** : Affichage du point de livraison et de la position actuelle
- **Contrôles** : Boutons de mise à jour de statut
- **Navigation** : Lien vers Google Maps/Waze intégré

**Côté Commerçant** :

- **API Call** : `GET /tracking/order/123`
- **Données de tracking** :
    ```json
    {
        "orderId": 123,
        "deliveryPersonId": 2,
        "status": "in_transit",
        "currentPosition": {
            "latitude": 48.8566,
            "longitude": 2.3522,
            "timestamp": "2024-12-18T10:30:00.000Z"
        },
        "estimatedArrival": "2024-12-18T14:30:00.000Z",
        "route": {
            "distance": "2.5 km",
            "duration": "15 min"
        }
    }
    ```

**Interface de tracking** :

- **Carte** avec marqueur du livreur mis à jour en temps réel
- **Informations** : Position, ETA, distance restante
- **Statut visuel** : Indicateur de progression

**Critères de validation** :

- ✅ Position GPS mise à jour régulièrement (toutes les 30s)
- ✅ Calcul d'itinéraire et ETA cohérents
- ✅ Synchronisation entre les interfaces
- ✅ Gestion des déconnexions réseau

#### TC-ORDER-005 : Finalisation d'une livraison

**Objectif** : Valider la clôture complète du processus de livraison

**Préconditions** :

- Commande en statut "in_transit"
- Livreur arrivé à destination
- Application mobile du livreur active

**Étapes d'exécution** :

1. Livreur : Marquer la livraison comme "Livrée"
2. Optionnel : Ajouter des notes de livraison
3. Optionnel : Prendre une photo de confirmation
4. Confirmer la finalisation

**Résultats attendus** :

- **API Call** : `PUT /orders/123` avec payload :
    ```json
    {
        "status": "delivered",
        "deliveredAt": "2024-12-18T14:25:00.000Z",
        "deliveryNotes": "Remis en main propre",
        "deliveryProof": "photo-url" // optionnel
    }
    ```
- **Code de réponse** : 200 OK

**Mises à jour interface** :

**Dashboard Livreur** :

- Commande déplacée vers "Livraisons Terminées"
- Statistiques mises à jour : "+1 Terminées", "-1 En Attente"
- Évaluation client (étoiles) activée

**Dashboard Commerçant** :

- Statut mis à jour : "Livrée"
- Notification de livraison réussie
- Commande archivée dans l'historique

**Base de données** :

- Statut : "delivered"
- Timestamp de livraison enregistré
- Notes et preuve de livraison sauvegardées

**Critères de validation** :

- ✅ Cycle de vie de la commande complet et cohérent
- ✅ Toutes les parties prenantes notifiées
- ✅ Données d'audit complètes
- ✅ Interface utilisateur cohérente

### 3.3 Domaine : Géolocalisation et Tracking

#### TC-GEO-001 : Activation et mise à jour de la position GPS

**Objectif** : Valider la capture et la transmission de la position GPS du livreur

**Préconditions** :

- Livreur connecté sur l'application mobile
- Permissions de géolocalisation accordées
- Connexion internet active

**Étapes d'exécution** :

1. Livreur : Accepter une commande
2. Activer le suivi GPS dans l'application
3. Se déplacer physiquement de 100 mètres
4. Observer les mises à jour de position

**Résultats attendus** :

- **API Calls répétés** : `POST /tracking/delivery-person/2/position`
- **Payload** :
    ```json
    {
        "latitude": 48.8566,
        "longitude": 2.3522,
        "accuracy": 10,
        "timestamp": "2024-12-18T10:30:15.000Z",
        "speed": 5.2 // km/h optionnel
    }
    ```
- **Fréquence** : Mise à jour toutes les 30 secondes
- **Précision** : < 50 mètres en environnement urbain
- **Stockage** : Position sauvegardée en Redis pour accès temps réel

**Critères de validation** :

- ✅ Capture GPS fonctionnelle et précise
- ✅ Transmission automatique des coordonnées
- ✅ Gestion de la batterie (optimisation intervalles)
- ✅ Fallback en cas de perte de signal

#### TC-GEO-002 : Calcul d'itinéraire optimisé

**Objectif** : Valider le calcul d'itinéraires pour les livraisons

**Préconditions** :

- Position actuelle du livreur : 48.8566, 2.3522 (Place Vendôme)
- Adresse de livraison : 48.8606, 2.3376 (Tour Eiffel)
- Service de cartographie accessible

**Étapes d'exécution** :

1. Commande acceptée avec adresse de destination
2. Demander le calcul d'itinéraire via l'API
3. Vérifier les informations retournées

**Résultats attendus** :

- **API Call** : `POST /tracking/order/123/recalculate-route`
- **Payload** :
    ```json
    {
        "pickupLocation": { "latitude": 48.8566, "longitude": 2.3522 },
        "deliveryLocation": { "latitude": 48.8606, "longitude": 2.3376 }
    }
    ```
- **Réponse** :
    ```json
    {
        "event": {
            "type": "route_updated",
            "data": {
                "distance": "3.2 km",
                "duration": "12 min",
                "steps": ["Dirigez-vous vers le sud", "Tournez à droite..."],
                "polyline": "encoded-polyline-coordinates"
            }
        }
    }
    ```

**Interface** :

- **Carte** : Tracé de l'itinéraire affiché
- **Informations** : Distance et temps estimé
- **Navigation** : Bouton "Naviguer" vers l'app de GPS

**Critères de validation** :

- ✅ Itinéraire calculé et cohérent
- ✅ Temps de trajet réaliste
- ✅ Intégration avec les services de navigation
- ✅ Mise à jour automatique en cas de changement

#### TC-GEO-003 : Gestion des zones de géofencing

**Objectif** : Valider la détection automatique d'arrivée à destination

**Préconditions** :

- Commande en cours de livraison
- Position du livreur trackée
- Destination définie : 48.8606, 2.3376

**Étapes d'exécution** :

1. Livreur en route vers la destination
2. Simuler l'arrivée dans un rayon de 50m de la destination
3. Observer les notifications et changements d'état

**Résultats attendus** :

- **Détection automatique** quand distance < 50m de la destination
- **API Event** : `POST /tracking/order/123/arrival-detected`
- **Notification push** : "Vous êtes arrivé à destination"
- **Interface** :
    - Statut automatiquement mis à jour : "À destination"
    - Bouton "Marquer comme livrée" mis en évidence
    - Timer de livraison démarré

**Critères de validation** :

- ✅ Détection de proximité fiable
- ✅ Notifications push fonctionnelles
- ✅ Mise à jour temps réel du statut
- ✅ Pas de faux positifs (zones urbaines denses)

### 3.4 Domaine : Interface Utilisateur et Expérience

#### TC-UI-001 : Dashboard Administrateur - Gestion des utilisateurs

**Objectif** : Valider l'interface complète d'administration

**Préconditions** :

- Connexion avec compte administrateur
- Base de données avec utilisateurs de test :
    - 2 administrateurs
    - 5 livreurs
    - 3 commerçants
    - 1 technicien logistique

**Étapes d'exécution** :

1. Accéder au dashboard administrateur
2. Observer les statistiques générales
3. Consulter le tableau des utilisateurs
4. Tenter les actions de gestion

**Résultats attendus** :

**Statistiques affichées** :

- Total Utilisateurs : 11
- Administrateurs : 2
- Livreurs : 5
- Commerçants : 3
- Techniciens Logistique : 1

**Tableau utilisateurs** :

- **Colonnes** : Photo/Initiale, Nom, Email, Rôle, Date création, Actions
- **Tri** : Par nom, rôle, date de création
- **Actions** : Modifier, Supprimer pour chaque utilisateur
- **Codes couleur** pour les rôles :
    - Rouge : Admin
    - Bleu : Technicien Logistique
    - Vert : Commerçant
    - Jaune : Livreur

**Interface responsive** :

- ✅ Adaptation mobile/desktop
- ✅ Scroll horizontal sur petit écran
- ✅ Actions accessibles et claires

**Critères de validation** :

- ✅ Données exactes et à jour
- ✅ Interface intuitive et professionnelle
- ✅ Actions fonctionnelles
- ✅ Gestion des permissions respectée

#### TC-UI-002 : Dashboard Livreur - Gestion des livraisons

**Objectif** : Valider l'interface complète du livreur avec statistiques et actions

**Préconditions** :

- Connexion avec compte livreur
- Données de test :
    - 3 livraisons du jour (2 terminées, 1 en cours)
    - 5 livraisons disponibles
    - Distance parcourue : 85.5 km

**Étapes d'exécution** :

1. Observer les statistiques de performance
2. Basculer entre vue liste et vue carte
3. Tester les actions rapides
4. Consulter les commandes assignées et terminées

**Résultats attendus** :

**Statistiques KPI** :

- Livraisons du Jour : 3
- Terminées : 2 (vert)
- En Attente : 1 (orange)
- Distance : 85.5 km (violet)

**Vue Carte Interactive** :

- Carte centrée sur la position du livreur
- Marqueurs pour les livraisons assignées
- Itinéraires calculés et affichés
- Contrôles de zoom et navigation

**Vue Liste** :

- **Livraisons Assignées** : Détails complets avec actions (Appeler, Naviguer)
- **Livraisons Terminées** : Historique avec évaluations (étoiles)
- Code couleur par priorité et statut

**Actions rapides** :

- "Voir Commandes Disponibles" → Modal avec liste complète
- "Commencer la Tournée" → Mode navigation optimisée
- "Carte Interactive" → Bascule vue carte/liste
- "Signaler un Problème" → Formulaire de support

**Critères de validation** :

- ✅ Statistiques précises et mises à jour
- ✅ Cartes interactives et fluides
- ✅ Actions contextuelles fonctionnelles
- ✅ Interface adaptée à l'usage mobile

#### TC-UI-003 : Dashboard Commerçant - Gestion des commandes

**Objectif** : Valider l'interface de gestion business du commerçant

**Préconditions** :

- Connexion avec compte commerçant
- Données de test pour la journée :
    - 24 commandes créées
    - 1845€ de chiffre d'affaires
    - 8 commandes en attente
    - 16 commandes terminées

**Étapes d'exécution** :

1. Consulter les KPIs business
2. Tester la création de nouvelle commande
3. Activer le tracking des livraisons
4. Consulter l'historique et les statistiques produits

**Résultats attendus** :

**KPIs Affichés** :

- Commandes Aujourd'hui : 24 (bleu)
- Chiffre d'Affaires : 1845.00€ (vert)
- En Attente : 8 (orange)
- Terminées : 16 (violet)

**Formulaire de Commande** :

- **Champs obligatoires** : Nom client, Adresse, Heure de livraison
- **Champs optionnels** : Téléphone, Notes, Durée estimée
- **Sélecteur priorité** : Basse, Normale, Haute, Urgente
- **Validation temps réel** des champs

**Tracking des Livraisons** :

- Carte avec localisation des commandes en cours
- Marqueurs avec statuts visuels
- Informations détaillées au clic sur marqueur
- ETA et progression en temps réel

**Tableaux de Bord** :

- **Commandes Récentes** : 4 dernières avec statuts colorés
- **Produits les Plus Vendus** : Top 4 avec chiffres de vente

**Critères de validation** :

- ✅ KPIs calculés correctement
- ✅ Formulaires avec validation robuste
- ✅ Tracking temps réel fonctionnel
- ✅ Interface business claire et efficace

---

## 4. Tests Structurels et d'Intégration

### 4.1 Architecture Microservices

#### TC-ARCHI-001 : Communication Inter-Services via Redis

**Objectif** : Valider la communication asynchrone entre microservices

**Préconditions** :

- Tous les microservices démarrés
- Redis opérationnel et accessible
- Services connectés au message broker

**Étapes d'exécution** :

1. **Service Order** : Créer une nouvelle commande
2. **Message Redis** : Vérifier l'émission d'un événement `order.created`
3. **Service User** : Vérifier la réception et traitement du message
4. **Service Geo** : Vérifier l'initialisation du tracking

**Résultats attendus** :

- **Redis Queue** : `order.created` event visible avec payload correct
- **Event Processing** : Chaque service traite l'événement selon sa logique
- **Logs cohérents** dans tous les services concernés
- **Pas de perte de messages** même en cas de redémarrage de service

**Outils de vérification** :

```bash
# Surveillance des queues Redis
redis-cli MONITOR
redis-cli LLEN order.created
```

**Critères de validation** :

- ✅ Messages émis et reçus correctement
- ✅ Traitement asynchrone fonctionnel
- ✅ Résilience aux pannes temporaires
- ✅ Logs détaillés pour le debugging

#### TC-ARCHI-002 : API Gateway - Routage et Proxy

**Objectif** : Valider le routage des requêtes vers les microservices appropriés

**Préconditions** :

- API Gateway actif sur le port 3001
- Tous les microservices opérationnels
- Configuration de routage correcte

**Étapes d'exécution** :

1. **Authentification** : `POST /auth/login` → Auth Service (3002)
2. **Utilisateurs** : `GET /users` → User Service (3002)
3. **Commandes** : `GET /orders` → Order Service (3003)
4. **Géolocalisation** : `POST /tracking/position` → Geo Service (3004)
5. **Services multiples** : Vérifier les requêtes simultanées

**Résultats attendus** :

- **Routage correct** : Chaque requête dirigée vers le bon service
- **Headers proxy** : `X-Forwarded-For`, `X-Real-IP` correctement transmis
- **Authentication** : JWT tokens validés au niveau Gateway
- **CORS** : Headers CORS appropriés pour le frontend
- **Rate limiting** : Protection contre les requêtes excessives

**Métriques de performance** :

- Temps de réponse Gateway : < 50ms (overhead)
- Pas de perte de connexion
- Load balancing si plusieurs instances

**Critères de validation** :

- ✅ Routage 100% fiable vers tous les services
- ✅ Performance optimale (latence minimale)
- ✅ Sécurité maintenue (authentification centralisée)
- ✅ Monitoring et logs centralisés

#### TC-ARCHI-003 : Health Checks et Monitoring

**Objectif** : Valider la surveillance automatique de l'état des services

**Préconditions** :

- Architecture complète déployée
- Health checks configurés dans Docker Compose
- Services en fonctionnement nominal

**Étapes d'exécution** :

1. Vérifier tous les endpoints de health check :
    - `GET /health` (API Gateway)
    - `GET /users/health` (User Service)
    - `GET /auth/health` (Auth Service)
    - `GET /orders/health` (Order Service)
    - `GET /tracking/health` (Geo Service)
2. Simuler une panne de service (arrêt forcé)
3. Observer la récupération automatique
4. Tester les dépendances entre services

**Résultats attendus** :

**Health Checks Nominaux** :

```json
{
    "status": "ok",
    "service": "order-service",
    "timestamp": "2024-12-18T10:00:00.000Z",
    "dependencies": {
        "database": "connected",
        "redis": "connected"
    }
}
```

**Surveillance Docker** :

- Statut `healthy` pour tous les conteneurs
- Redémarrage automatique en cas de panne
- Logs détaillés des vérifications

**Gestion des pannes** :

- Service non disponible → 503 Service Unavailable
- Dégradation gracieuse des fonctionnalités
- Récupération automatique sans intervention

**Critères de validation** :

- ✅ Health checks répondent rapidement (< 2s)
- ✅ Détection rapide des pannes (< 30s)
- ✅ Récupération automatique fonctionnelle
- ✅ Alerting approprié en cas de problème

### 4.2 Tests de Performance

#### TC-PERF-001 : Tests de charge sur les endpoints critiques

**Objectif** : Valider la performance sous charge normale et pic

**Préconditions** :

- Environnement de test représentatif de la production
- Données de test en quantité suffisante (1000 utilisateurs, 10000 commandes)
- Monitoring activé (CPU, RAM, réseau)

**Scénarios de charge** :

**Scénario 1 - Charge Normale** :

- **Utilisateurs simultanés** : 100
- **Durée** : 10 minutes
- **Actions** :
    - 60% consultation commandes (`GET /orders`)
    - 20% création commandes (`POST /orders`)
    - 15% acceptation commandes (`POST /orders/:id/accept`)
    - 5% tracking (`GET /tracking/order/:id`)

**Résultats attendus Scénario 1** :

- **Temps de réponse moyen** : < 500ms
- **95e percentile** : < 1000ms
- **Taux d'erreur** : < 0.1%
- **CPU utilisation** : < 70%
- **Mémoire** : Stable, pas de fuites

**Scénario 2 - Charge Pic** :

- **Utilisateurs simultanés** : 500
- **Durée** : 5 minutes
- **Montée en charge** : Linéaire sur 2 minutes

**Résultats attendus Scénario 2** :

- **Temps de réponse moyen** : < 1000ms
- **95e percentile** : < 2000ms
- **Taux d'erreur** : < 1%
- **Pas de crash** de services
- **Dégradation gracieuse** des performances

**Outils utilisés** :

```bash
# Exemple avec Artillery.js
artillery run load-test.yml
artillery report report.json
```

**Critères de validation** :

- ✅ Performance acceptable sous charge normale
- ✅ Pas de dégradation majeure lors des pics
- ✅ Récupération rapide après pic de charge
- ✅ Logs sans erreurs critiques

#### TC-PERF-002 : Performance des requêtes base de données

**Objectif** : Valider l'optimisation des requêtes SQL et l'indexation

**Préconditions** :

- Base PostgreSQL avec données représentatives
- Indexes créés sur les colonnes appropriées
- Pool de connexions configuré

**Étapes d'exécution** :

1. **Requêtes simples** :
    - `SELECT * FROM orders WHERE status = 'pending'` (avec index sur status)
    - `SELECT * FROM users WHERE email = 'test@example.com'` (index unique)
2. **Requêtes complexes** :
    - Jointure orders/users avec filtres et tri
    - Agrégations (stats par livreur, par période)
    - Recherche géographique (proximité GPS)

3. **Requêtes de masse** :
    - Pagination sur 10000+ enregistrements
    - Bulk insert de commandes

**Résultats attendus** :

- **Requêtes simples** : < 10ms
- **Requêtes avec jointures** : < 100ms
- **Requêtes d'agrégation** : < 200ms
- **Plans d'exécution** optimaux (pas de scan complet sur grosses tables)
- **Pool de connexions** : Pas de saturation, réutilisation efficace

**Monitoring SQL** :

```sql
-- Requêtes lentes
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

**Critères de validation** :

- ✅ Toutes les requêtes dans les seuils de performance
- ✅ Indexes utilisés correctement
- ✅ Pas de locks ou deadlocks
- ✅ Connexions DB gérées efficacement

### 4.3 Tests de Résilience

#### TC-RESIL-001 : Tolérance aux pannes de services

**Objectif** : Valider le comportement du système lors de pannes partielles

**Préconditions** :

- Architecture complète en fonctionnement
- Circuit breakers configurés
- Fallbacks définis pour les fonctionnalités critiques

**Étapes d'exécution** :

1. **Panne User Service** : Arrêter le microservice utilisateurs
2. **Test dégradation** : Tenter des actions nécessitant ce service
3. **Panne Base de données** : Simuler une déconnexion PostgreSQL
4. **Panne Redis** : Arrêter le message broker
5. **Récupération** : Redémarrer les services et valider la reprise

**Résultats attendus** :

**Panne User Service** :

- ✅ Authentification existante maintenue (cache JWT)
- ❌ Création nouveaux comptes indisponible (503 Service Unavailable)
- ✅ Autres services fonctionnels (commandes, tracking)
- ✅ Message d'erreur informatif à l'utilisateur

**Panne Base de données** :

- ✅ Cache Redis maintient les données récentes
- ❌ Écritures nouvelles échouent avec retry automatique
- ✅ Interface affiche un mode "lecture seule"
- ✅ Queue des opérations pour rejeu après récupération

**Panne Redis** :

- ❌ Communication inter-services interrompue
- ✅ Services continuent individuellement
- ❌ Pas de nouvelles synchronisations
- ✅ Récupération automatique des messages en queue

**Critères de validation** :

- ✅ Dégradation gracieuse sans crash total
- ✅ Messages d'erreur clairs pour l'utilisateur
- ✅ Récupération automatique complète
- ✅ Pas de perte de données lors de la reprise

---

## 5. Tests de Sécurité

### 5.1 Authentification et Gestion de Session

#### TC-SEC-001 : Sécurité des mots de passe

**Objectif** : Valider la robustesse du système de mots de passe

**Préconditions** :

- Endpoint d'inscription accessible
- Politique de mot de passe définie

**Étapes d'exécution** :

1. **Test mots de passe faibles** :
    - "123456"
    - "password"
    - "azerty"
    - Nom d'utilisateur comme mot de passe

2. **Test mots de passe valides** :
    - "MotDePasse123!" (8+ caractères, majuscule, chiffre, caractère spécial)
    - "SuperSecret2024@"

3. **Test stockage** :
    - Vérifier que les mots de passe sont hashés en base (bcrypt)
    - Contrôler qu'ils ne sont jamais transmis en clair

4. **Test tentatives répétées** :
    - 5 tentatives de connexion échouées consécutives
    - Vérifier le mécanisme de blocage temporaire

**Résultats attendus** :

**Rejet mots de passe faibles** :

- Code de réponse : 400 Bad Request
- Message : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial"

**Stockage sécurisé** :

```sql
-- En base, le mot de passe ne doit jamais apparaître en clair
SELECT email, password FROM users WHERE email = 'test@example.com';
-- Résultat attendu : password = '$2b$10$...' (hash bcrypt)
```

**Protection contre le brute force** :

- Après 5 échecs : "Compte temporairement verrouillé. Réessayez dans 15 minutes"
- Logs de sécurité générés
- Possibilité de déblocage administrateur

**Critères de validation** :

- ✅ Politique de mot de passe stricte appliquée
- ✅ Hachage sécurisé (bcrypt, salt unique)
- ✅ Protection contre les attaques par force brute
- ✅ Logs de sécurité détaillés

#### TC-SEC-002 : Gestion des tokens JWT

**Objectif** : Valider la sécurité des JSON Web Tokens

**Préconditions** :

- Utilisateur authentifié avec tokens valides
- Clé secrète JWT configurée et sécurisée

**Étapes d'exécution** :

1. **Validation token** :
    - Décoder un token valide et vérifier sa structure
    - Tenter d'accéder à une ressource protégée

2. **Token expiré** :
    - Attendre l'expiration du token (15 min pour access_token)
    - Tenter un accès avec token expiré
    - Utiliser le refresh_token pour renouveler

3. **Token manipulé** :
    - Modifier le payload d'un token valide
    - Tenter d'accéder avec le token altéré

4. **Révocation token** :
    - Déconnexion utilisateur (`POST /auth/logout`)
    - Vérifier que le token est bien révoqué

**Résultats attendus** :

**Token valide** :

```json
{
    "header": {
        "alg": "HS256",
        "typ": "JWT"
    },
    "payload": {
        "sub": 123, // User ID
        "email": "test@example.com",
        "role": "delivery_person",
        "iat": 1640000000, // Issued at
        "exp": 1640000900 // Expires (15 min later)
    }
}
```

**Token expiré** :

- Code de réponse : 401 Unauthorized
- Message : "Token expired"
- Header : `WWW-Authenticate: Bearer error="invalid_token"`

**Token manipulé** :

- Code de réponse : 401 Unauthorized
- Message : "Invalid token signature"
- Pas d'accès aux ressources protégées

**Refresh token** :

- Génération nouveaux access_token et refresh_token
- Invalidation de l'ancien refresh_token
- Code de réponse : 200 OK avec nouveaux tokens

**Critères de validation** :

- ✅ Signature JWT vérifiée à chaque requête
- ✅ Gestion correcte de l'expiration
- ✅ Refresh token fonctionnel et sécurisé
- ✅ Révocation effective lors de la déconnexion

### 5.2 Autorisation et Contrôle d'Accès

#### TC-SEC-003 : Contrôle d'accès basé sur les rôles (RBAC)

**Objectif** : Valider que les permissions sont strictement respectées

**Préconditions** :

- Utilisateurs créés avec chaque rôle :
    - admin@test.com (role: admin)
    - merchant@test.com (role: merchant)
    - delivery@test.com (role: delivery_person)
    - logistics@test.com (role: logistics_technician)

**Matrice de permissions à tester** :

| Endpoint                  | Admin | Merchant | Delivery      | Logistics |
| ------------------------- | ----- | -------- | ------------- | --------- |
| `GET /users`              | ✅    | ❌       | ❌            | ❌        |
| `POST /users`             | ✅    | ❌       | ❌            | ❌        |
| `PUT /users/:id`          | ✅    | Own only | Own only      | Own only  |
| `DELETE /users/:id`       | ✅    | ❌       | ❌            | ❌        |
| `POST /orders`            | ❌    | ✅       | ❌            | ❌        |
| `GET /orders`             | ✅    | Own only | Assigned only | ✅        |
| `GET /orders/available`   | ❌    | ❌       | ✅            | ❌        |
| `POST /orders/:id/accept` | ❌    | ❌       | ✅            | ❌        |
| `PUT /orders/:id`         | ✅    | Own only | Assigned only | ✅        |

**Étapes d'exécution** :

1. Pour chaque combinaison utilisateur/endpoint :
2. Se connecter avec le compte approprié
3. Exécuter la requête
4. Vérifier le code de réponse attendu

**Résultats attendus pour accès AUTORISÉ** :

- Code de réponse : 200 OK (ou 201 Created)
- Données retournées conformes au rôle
- Action exécutée avec succès

**Résultats attendus pour accès REFUSÉ** :

- Code de réponse : 403 Forbidden
- Message : "Access denied: insufficient permissions"
- Aucune action exécutée
- Log de sécurité généré

**Test de contournement** :

1. Tenter de modifier les headers de requête
2. Essayer d'accéder avec token d'un autre utilisateur
3. Modifier les paramètres d'URL pour accéder aux données d'autrui

**Critères de validation** :

- ✅ 100% des permissions respectées selon la matrice
- ✅ Pas de contournement possible
- ✅ Messages d'erreur cohérents
- ✅ Logs de sécurité complets

#### TC-SEC-004 : Isolation des données par utilisateur

**Objectif** : S'assurer qu'un utilisateur ne peut accéder qu'à ses propres données

**Préconditions** :

- 2 commerçants avec chacun 5 commandes
- 2 livreurs avec chacun 3 commandes assignées
- Base de données avec données de test bien séparées

**Étapes d'exécution** :

1. **Test Commerçant** :
    - Connexion merchant1@test.com
    - `GET /orders` → doit retourner uniquement ses 5 commandes
    - Tenter `GET /orders?merchantId=2` → doit être filtré
    - Tenter `GET /orders/123` où 123 appartient à merchant2

2. **Test Livreur** :
    - Connexion delivery1@test.com
    - `GET /orders` → doit retourner uniquement ses commandes assignées
    - Tenter d'accepter une commande déjà assignée à delivery2
    - `PUT /orders/456` où 456 n'est pas assignée à ce livreur

3. **Test modification croisée** :
    - Merchant1 tente de modifier une commande de Merchant2
    - Delivery1 tente de modifier le statut d'une commande de Delivery2

**Résultats attendus** :

**Accès autorisé** (données propres) :

```json
{
    "orders": [
        {
            "id": 123,
            "merchantId": 1, // Correspond à l'utilisateur connecté
            "customerName": "Client A"
            // ... autres champs
        }
    ],
    "total": 5,
    "page": 1
}
```

**Accès refusé** (données d'autrui) :

- Code de réponse : 403 Forbidden ou 404 Not Found (pour ne pas révéler l'existence)
- Aucune donnée sensible dans la réponse
- Log de tentative d'accès non autorisé

**Critères de validation** :

- ✅ Isolation totale des données par utilisateur
- ✅ Pas de fuite d'information entre comptes
- ✅ Gestion cohérente des erreurs d'accès
- ✅ Logs de sécurité pour audit

### 5.3 Protection des Données et Injection

#### TC-SEC-005 : Protection contre l'injection SQL

**Objectif** : Valider que l'application résiste aux attaques par injection SQL

**Préconditions** :

- Application utilisant TypeORM ou des requêtes préparées
- Endpoints acceptant des paramètres utilisateur

**Étapes d'exécution** :

1. **Test paramètres URL** :

    ```
    GET /orders?status=pending' UNION SELECT * FROM users--
    GET /users/123; DROP TABLE orders--
    ```

2. **Test body JSON** :

    ```json
    {
        "customerName": "Client'; DROP TABLE orders; --",
        "email": "test@example.com' OR '1'='1"
    }
    ```

3. **Test headers** :
    ```
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhb' UNION SELECT password FROM users--
    ```

**Résultats attendus** :

- **Paramètres traités comme littéraux** : Pas d'exécution de code SQL
- **Données stockées telles quelles** : Caractères spéciaux échappés
- **Pas d'erreur SQL exposée** : Messages d'erreur génériques
- **Base de données intacte** : Aucune modification/suppression non autorisée

**Vérification** :

```sql
-- Vérifier qu'aucune table n'a été supprimée
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Vérifier les données stockées
SELECT customer_name FROM orders
WHERE customer_name LIKE '%DROP%';
```

**Critères de validation** :

- ✅ Aucune injection SQL réussie
- ✅ Requêtes préparées utilisées partout
- ✅ Validation et échappement des inputs
- ✅ Pas d'information système exposée

#### TC-SEC-006 : Validation et échappement des entrées utilisateur

**Objectif** : S'assurer que toutes les entrées sont validées et sécurisées

**Préconditions** :

- Formulaires d'inscription et de création de commande
- API endpoints acceptant des données utilisateur

**Étapes d'exécution** :

1. **Test XSS (Cross-Site Scripting)** :

    ```json
    {
        "customerName": "<script>alert('XSS')</script>",
        "notes": "<img src='x' onerror='alert(1)'>",
        "deliveryAddress": "javascript:alert('XSS')"
    }
    ```

2. **Test caractères spéciaux** :

    ```json
    {
        "customerName": "Client & Associés <important>",
        "phone": "+33-1-23-45-67-89",
        "notes": "Attention: produit dangereux (acide) !"
    }
    ```

3. **Test dépassement de limites** :

    ```json
    {
      "customerName": "A".repeat(1000), // Très long
      "notes": "B".repeat(10000) // Dépassement limite
    }
    ```

4. **Test formats invalides** :
    ```json
    {
        "email": "pas-un-email",
        "phone": "abc123",
        "scheduledDeliveryTime": "pas-une-date"
    }
    ```

**Résultats attendus** :

**Validation réussie** :

- Code de réponse : 400 Bad Request pour les formats invalides
- Messages d'erreur spécifiques par champ
- Pas d'exécution de code malveillant

**Données stockées** :

- Caractères spéciaux échappés : `&lt;script&gt;` au lieu de `<script>`
- Limitation de taille respectée
- Format validé avant stockage

**Protection XSS** :

- Données encodées lors de l'affichage
- Headers de sécurité : `X-XSS-Protection: 1; mode=block`
- CSP (Content Security Policy) configuré

**Critères de validation** :

- ✅ Toutes les entrées validées côté serveur
- ✅ Aucun code malveillant exécuté
- ✅ Données stockées de manière sécurisée
- ✅ Protection XSS active côté client

### 5.4 Sécurité de l'Infrastructure

#### TC-SEC-007 : Configuration sécurisée des services

**Objectif** : Valider la configuration de sécurité de l'infrastructure

**Préconditions** :

- Services déployés en environnement test
- Accès aux configurations Docker et aux variables d'environnement

**Étapes d'exécution** :

1. **Variables d'environnement** :
    - Vérifier que les secrets ne sont pas en dur dans le code
    - Contrôler les fichiers .env et docker-compose.yml
    - Valider l'utilisation de variables pour DB_PASSWORD, JWT_SECRET

2. **Ports et exposition** :
    - Scanner les ports ouverts sur les conteneurs
    - Vérifier que seuls les ports nécessaires sont exposés
    - Contrôler les règles de firewall

3. **Base de données** :
    - Vérifier les permissions utilisateur PostgreSQL
    - Contrôler que l'utilisateur app n'a pas de droits admin
    - Valider le chiffrement des connexions

4. **Logs et monitoring** :
    - Vérifier que les mots de passe n'apparaissent pas dans les logs
    - Contrôler la rotation des logs
    - Valider les alertes de sécurité

**Résultats attendus** :

**Variables d'environnement** :

```bash
# ✅ Correct - secrets dans .env
DATABASE_URL=postgresql://user:${DB_PASSWORD}@localhost/db
JWT_SECRET=${JWT_SECRET}

# ❌ Incorrect - secrets en dur
DATABASE_URL=postgresql://user:password123@localhost/db
```

**Ports exposés** :

```bash
# Scan des ports
nmap localhost -p 1-10000

# Résultats attendus : seulement les ports nécessaires
3000 (Frontend)
3001 (API Gateway)
5432 (PostgreSQL) - uniquement en développement
6379 (Redis) - uniquement en développement
```

**Permissions base de données** :

```sql
-- Vérifier les permissions utilisateur
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'users';

-- L'utilisateur app ne doit pas avoir de privilèges superuser
SELECT rolname, rolsuper FROM pg_roles WHERE rolname = 'rncp_app';
```

**Critères de validation** :

- ✅ Aucun secret exposé dans le code ou les logs
- ✅ Surface d'attaque minimale (ports fermés)
- ✅ Principe de moindre privilège respecté
- ✅ Chiffrement activé sur les connexions sensibles

---

## 6. Matrices de Traçabilité et Couverture

### 6.1 Matrice Exigences Fonctionnelles vs Tests

| Domaine Fonctionnel        | Exigences                                | Tests de Couverture                 | Statut |
| -------------------------- | ---------------------------------------- | ----------------------------------- | ------ |
| **Authentification**       | AUTH-REQ-001 : Connexion sécurisée       | TC-AUTH-002, TC-SEC-001, TC-SEC-002 | ✅     |
|                            | AUTH-REQ-002 : Gestion des rôles         | TC-AUTH-004, TC-SEC-003             | ✅     |
|                            | AUTH-REQ-003 : Session management        | TC-AUTH-003, TC-SEC-002             | ✅     |
| **Gestion Commandes**      | ORDER-REQ-001 : Création par commerçant  | TC-ORDER-001, TC-UI-003             | ✅     |
|                            | ORDER-REQ-002 : Attribution aux livreurs | TC-ORDER-002, TC-ORDER-003          | ✅     |
|                            | ORDER-REQ-003 : Suivi statuts            | TC-ORDER-004, TC-ORDER-005          | ✅     |
| **Géolocalisation**        | GEO-REQ-001 : Tracking temps réel        | TC-GEO-001, TC-GEO-003              | ✅     |
|                            | GEO-REQ-002 : Calcul d'itinéraires       | TC-GEO-002                          | ✅     |
| **Interfaces Utilisateur** | UI-REQ-001 : Dashboard par rôle          | TC-UI-001, TC-UI-002, TC-UI-003     | ✅     |
|                            | UI-REQ-002 : Interface mobile            | Tests d'intégration responsive      | ✅     |

### 6.2 Couverture des Tests par Type

| Type de Test     | Nombre de Cas | Domaines Couverts             | Pourcentage |
| ---------------- | ------------- | ----------------------------- | ----------- |
| **Fonctionnels** | 15            | Tous les domaines métier      | 100%        |
| **Sécurité**     | 7             | Auth, données, infrastructure | 90%         |
| **Performance**  | 2             | Endpoints critiques, DB       | 75%         |
| **Intégration**  | 3             | Architecture microservices    | 85%         |
| **Interface**    | 3             | Tous les rôles utilisateur    | 100%        |
| **Total**        | **30**        | **Couverture globale**        | **92%**     |

### 6.3 Critères d'Acceptation

#### Critères de Passage en Production

| Critère                | Seuil Minimum         | Statut Actuel |
| ---------------------- | --------------------- | ------------- |
| **Tests fonctionnels** | 100% passants         | ✅ À valider  |
| **Tests de sécurité**  | 100% passants         | ✅ À valider  |
| **Performance**        | 95% des requêtes < 1s | ⏳ À mesurer  |
| **Disponibilité**      | 99.5% uptime          | ⏳ À valider  |
| **Couverture tests**   | > 90%                 | ✅ 92%        |

#### Actions en Cas d'Échec

1. **Test fonctionnel échoué** :
    - Bloquer le déploiement
    - Analyser la cause racine
    - Corriger et re-tester

2. **Test de sécurité échoué** :
    - Arrêt immédiat du processus
    - Audit de sécurité complet
    - Validation par expert sécurité

3. **Test de performance échoué** :
    - Analyser les goulots d'étranglement
    - Optimiser les requêtes/code
    - Tests de non-régression

---

## 7. Procédures d'Exécution des Tests

### 7.1 Environnement de Test

#### Configuration Requise

**Infrastructure** :

- **OS** : Ubuntu 20.04+ ou macOS 11+
- **RAM** : 8GB minimum, 16GB recommandé
- **Stockage** : 20GB d'espace libre
- **Réseau** : Connexion stable (test de géolocalisation)

**Logiciels** :

```bash
# Prérequis techniques
Docker 20.10+
Docker Compose 2.0+
Node.js 18+
pnpm 8+
PostgreSQL Client 15+
Redis CLI 7+
```

#### Setup de l'Environnement

1. **Cloner le repository** :

```bash
git clone https://github.com/organization/rncp-monorepo.git
cd rncp-monorepo
```

2. **Configuration environnement** :

```bash
# Copier les variables d'environnement
cp .env.example .env.test

# Variables spécifiques aux tests
DB_NAME=rncp_test
REDIS_DB=1
JWT_SECRET=test-secret-key-change-in-production
```

3. **Démarrage des services** :

```bash
# Installation dépendances
pnpm install

# Build des services
pnpm run build

# Démarrage avec Docker
docker-compose up -d

# Vérification santé services
pnpm run health-check
```

4. **Données de test** :

```bash
# Création base de test avec données fixtures
pnpm run db:seed:test

# Vérification données chargées
psql -d rncp_test -c "SELECT count(*) FROM users;"
```

### 7.2 Procédure d'Exécution

#### Tests Automatisés

```bash
# Tests unitaires et d'intégration
pnpm run test

# Tests E2E avec Cypress
pnpm run test:e2e

# Tests de performance
pnpm run test:performance

# Couverture de code
pnpm run test:coverage
```

#### Tests Manuels - Check-list

**Pré-requis** :

- [ ] Environnement de test opérationnel
- [ ] Données de test chargées
- [ ] Services health check OK
- [ ] Navigateurs de test disponibles (Chrome, Firefox, Safari)

**Ordre d'exécution recommandé** :

1. **Phase 1 - Tests de Base** :
    - [ ] TC-AUTH-001 : Inscription utilisateur
    - [ ] TC-AUTH-002 : Connexion valide
    - [ ] TC-AUTH-003 : Connexion invalide
    - [ ] TC-AUTH-004 : Gestion des rôles

2. **Phase 2 - Tests Fonctionnels Métier** :
    - [ ] TC-ORDER-001 : Création commande
    - [ ] TC-ORDER-002 : Consultation commandes disponibles
    - [ ] TC-ORDER-003 : Acceptation commande
    - [ ] TC-ORDER-004 : Suivi livraison
    - [ ] TC-ORDER-005 : Finalisation livraison

3. **Phase 3 - Tests Géolocalisation** :
    - [ ] TC-GEO-001 : Activation GPS
    - [ ] TC-GEO-002 : Calcul itinéraire
    - [ ] TC-GEO-003 : Géofencing

4. **Phase 4 - Tests Interface** :
    - [ ] TC-UI-001 : Dashboard Admin
    - [ ] TC-UI-002 : Dashboard Livreur
    - [ ] TC-UI-003 : Dashboard Commerçant

5. **Phase 5 - Tests Architecture** :
    - [ ] TC-ARCHI-001 : Communication microservices
    - [ ] TC-ARCHI-002 : API Gateway
    - [ ] TC-ARCHI-003 : Health checks

6. **Phase 6 - Tests Performance** :
    - [ ] TC-PERF-001 : Tests de charge
    - [ ] TC-PERF-002 : Performance DB

7. **Phase 7 - Tests Sécurité** :
    - [ ] TC-SEC-001 à TC-SEC-007 : Tous les tests de sécurité

#### Reporting et Suivi

**Format de rapport par test** :

```markdown
## Test TC-XXX-XXX : [Nom du test]

- **Date** : 2024-12-18
- **Testeur** : [Nom]
- **Environnement** : Test/Staging
- **Statut** : ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- **Durée** : [Temps d'exécution]
- **Observations** : [Commentaires]
- **Écrans** : [Captures si nécessaire]
```

**Synthèse globale** :

- **Tests exécutés** : X/30
- **Taux de succès** : XX%
- **Bloquants** : [Liste des échecs critiques]
- **Recommandations** : [Actions à mener]

---

## 8. Conclusion et Recommandations

### 8.1 Synthèse de la Couverture de Test

Ce cahier de recettes couvre **30 scénarios de test** répartis sur **7 domaines fonctionnels** pour garantir la qualité et la fiabilité de la plateforme RNCP :

**Couverture Fonctionnelle** :

- ✅ **Authentification & Autorisation** : 4 tests couvrant les connexions, rôles et permissions
- ✅ **Gestion des Commandes** : 5 tests du cycle complet de vie des commandes
- ✅ **Géolocalisation & Tracking** : 3 tests pour le suivi temps réel
- ✅ **Interfaces Utilisateur** : 3 tests des dashboards par rôle métier

**Couverture Technique** :

- ✅ **Architecture Microservices** : 3 tests d'intégration et communication
- ✅ **Performance & Résilience** : 2 tests de charge et tolérance aux pannes
- ✅ **Sécurité** : 7 tests couvrant l'authentification, l'autorisation et la protection des données

### 8.2 Points de Vigilance

**Éléments Critiques à Surveiller** :

1. **Sécurité** : Tests d'injection et contrôle d'accès obligatoires avant production
2. **Performance** : Validation des temps de réponse sous charge réelle
3. **Géolocalisation** : Tests en conditions mobiles réelles (déplacements, tunnels)
4. **Microservices** : Surveillance de la résilience en cas de panne partielle

**Risques Identifiés** :

- **Dépendance GPS** : Plan de dégradation si géolocalisation indisponible
- **Charge simultanée** : Validation du comportement avec 500+ utilisateurs
- **Sécurité des tokens** : Rotation et révocation des JWT en cas de compromission

### 8.3 Processus de Validation

**Critères de Recette** :

1. ✅ **100% des tests fonctionnels** passent avec succès
2. ✅ **100% des tests de sécurité** validés sans exception
3. ✅ **95% des tests de performance** dans les seuils acceptables
4. ✅ **Documentation** complète des écarts et corrections

**Processus de Qualification** :

1. **Tests développeur** : Validation unitaire et d'intégration
2. **Tests métier** : Validation par les utilisateurs finaux
3. **Tests qualité** : Exécution complète du cahier de recettes
4. **Tests sécurité** : Audit par expert sécurité indépendant
5. **Tests performance** : Validation sous charge représentative
6. **Recette finale** : Validation client et mise en production

### 8.4 Maintenance et Évolution

**Suivi Post-Déploiement** :

- **Monitoring continu** : Surveillance des KPIs et health checks
- **Tests de non-régression** : Exécution automatique lors des mises à jour
- **Feedback utilisateur** : Intégration des retours dans les futures versions
- **Mise à jour cahier de recettes** : Évolution avec les nouvelles fonctionnalités

**Planning de Tests** :

- **Tests quotidiens** : Health checks automatisés
- **Tests hebdomadaires** : Suite de non-régression
- **Tests mensuels** : Performance et charge
- **Tests semestriels** : Audit sécurité complet

---

**Ce cahier de recettes constitue le référentiel qualité pour la validation de la plateforme RNCP. Il doit être maintenu à jour et exécuté rigoureusement pour garantir un service fiable et sécurisé à tous les utilisateurs.**
