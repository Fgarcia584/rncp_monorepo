# Cahier de Recettes Concis - Plateforme RNCP PWA

## 1. Scénarios de Test Essentiels

### 1.1 Création de Compte

**TC-001 : Inscription nouvel utilisateur**

**Étapes** :
1. Accéder à l'application PWA
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire :
   - Nom : "Jean Dupont"
   - Email : "jean.dupont@example.com"
   - Mot de passe : "MotDePasse123!"
   - Rôle : "delivery_person"
4. Valider l'inscription

**Résultats attendus** :
- ✅ Compte créé avec succès
- ✅ Connexion automatique
- ✅ Redirection vers le dashboard approprié
- ✅ Token JWT stocké dans cookie httpOnly sécurisé

---

### 1.2 Création et Gestion de Commande

**TC-002 : Création d'une commande (Commerçant)**

**Prérequis** : Connecté en tant que commerçant

**Étapes** :
1. Cliquer sur "Nouvelle Livraison"
2. Remplir les informations :
   - Client : "Marie Martin"
   - Téléphone : "0123456789"
   - Adresse : "123 Rue de la Paix, 75001 Paris"
   - Heure de livraison : Sélectionner date/heure
   - Priorité : "Haute"
3. Créer la commande

**Résultats attendus** :
- ✅ Commande créée avec statut "pending"
- ✅ Visible dans la liste des commandes
- ✅ Notification de confirmation

**TC-003 : Acceptation de commande (Livreur)**

**Prérequis** : Connecté en tant que livreur

**Étapes** :
1. Cliquer sur "Voir Commandes Disponibles"
2. Sélectionner une commande
3. Cliquer sur "Accepter"

**Résultats attendus** :
- ✅ Commande assignée au livreur
- ✅ Statut mis à jour : "accepted"
- ✅ Commande ajoutée aux "Livraisons Assignées"

---

### 1.3 Affichage et Suivi de Trajet

**TC-004 : Visualisation du trajet en temps réel**

**Prérequis** : Commande acceptée par un livreur

**Étapes** :
1. **Côté Livreur** :
   - Activer "Vue Carte Interactive"
   - Observer sa position et le point de livraison
   - Démarrer la livraison

2. **Côté Commerçant** :
   - Accéder à "Tracking Livraisons"
   - Observer la position du livreur en temps réel

**Résultats attendus** :
- ✅ Carte interactive affichée
- ✅ Position GPS du livreur mise à jour toutes les 30 secondes
- ✅ Itinéraire calculé et affiché
- ✅ Temps estimé d'arrivée visible
- ✅ Marqueurs pour point de départ et destination

---

### 1.4 Installation PWA

**TC-005 : Installation de l'application**

**Étapes** :
1. Accéder à l'application via navigateur mobile
2. Attendre l'apparition de la bannière d'installation (ou via menu navigateur)
3. Cliquer sur "Installer" ou "Ajouter à l'écran d'accueil"
4. Confirmer l'installation

**Résultats attendus** :
- ✅ Icône ajoutée à l'écran d'accueil
- ✅ Application lance en mode plein écran
- ✅ Splash screen affiché au démarrage
- ✅ Fonctionnement identique à une app native

---

### 1.5 Fonctionnement Hors Ligne

**TC-006 : Utilisation offline**

**Prérequis** : Application PWA installée et utilisée au moins une fois en ligne

**Étapes** :
1. Activer le mode avion ou désactiver le réseau
2. Ouvrir l'application PWA
3. Naviguer dans les différentes sections :
   - Consulter les commandes précédemment chargées
   - Accéder au profil utilisateur
   - Visualiser les statistiques

**Résultats attendus** :
- ✅ Application s'ouvre sans connexion internet
- ✅ Données mises en cache disponibles
- ✅ Interface utilisateur fonctionnelle
- ✅ Message informatif "Mode hors ligne" affiché
- ✅ Actions nécessitant le réseau mises en file d'attente

**TC-007 : Synchronisation au retour en ligne**

**Prérequis** : Actions effectuées en mode hors ligne

**Étapes** :
1. Réactiver la connexion internet
2. Observer la synchronisation automatique
3. Vérifier la mise à jour des données

**Résultats attendus** :
- ✅ Synchronisation automatique des données
- ✅ Actions en attente exécutées
- ✅ Nouvelles données téléchargées
- ✅ Notification de retour en ligne

---

## 2. Matrice de Test Simplifiée

| Fonctionnalité | Test | Priorité | Statut |
|----------------|------|----------|--------|
| **Compte Utilisateur** | Inscription | Critique | ⏳ |
| | Connexion (cookies httpOnly) | Critique | ⏳ |
| **Commandes** | Création (Commerçant) | Critique | ⏳ |
| | Acceptation (Livreur) | Critique | ⏳ |
| | Finalisation livraison | Haute | ⏳ |
| **Tracking GPS** | Affichage carte | Critique | ⏳ |
| | Mise à jour position | Critique | ⏳ |
| | Calcul itinéraire | Haute | ⏳ |
| **PWA** | Installation app | Haute | ⏳ |
| | Mode hors ligne | Haute | ⏳ |
| | Synchronisation | Haute | ⏳ |
| | Notifications push | Moyenne | ⏳ |

---

## 3. Environnement de Test

### Configuration requise

```bash
# Services à démarrer
pnpm run dev:microservices  # Backend microservices
pnpm run dev:front          # Frontend PWA

# Vérification santé
GET /health                  # API Gateway
GET /users/health           # User Service
GET /orders/health          # Order Service
GET /tracking/health        # Geo Service
```

### Données de test

**Utilisateurs de test** :
- `admin@test.com` / `Admin123!` (Administrateur)
- `merchant@test.com` / `Merchant123!` (Commerçant)
- `delivery@test.com` / `Delivery123!` (Livreur)

---

## 4. Checklist de Validation

### Fonctionnalités Core
- [ ] Création de compte fonctionnelle
- [ ] Authentification avec JWT (cookies httpOnly)
- [ ] Création de commande
- [ ] Acceptation par livreur
- [ ] Tracking GPS temps réel
- [ ] Finalisation de livraison

### Capacités PWA
- [ ] Installation sur mobile
- [ ] Icône et splash screen
- [ ] Service Worker actif
- [ ] Cache des données
- [ ] Mode hors ligne opérationnel
- [ ] Synchronisation au retour en ligne
- [ ] Notifications push (optionnel)

### Performance
- [ ] Temps de chargement < 3s
- [ ] Mise à jour GPS fluide
- [ ] Interface réactive
- [ ] Pas de fuites mémoire

---

## 5. Critères d'Acceptation

**Critères Minimum** :
- ✅ Parcours utilisateur complet fonctionnel (inscription → commande → livraison)
- ✅ Tracking GPS opérationnel avec carte interactive
- ✅ Installation PWA réussie sur Android/iOS
- ✅ Mode hors ligne avec données en cache
- ✅ Synchronisation automatique au retour en ligne
- ✅ Interface responsive (mobile/desktop)
- ✅ Temps de réponse < 2 secondes

**Validation finale** : L'application doit permettre un cycle complet de commande/livraison avec tracking temps réel, être installable comme une app native, et fonctionner en mode dégradé hors ligne.