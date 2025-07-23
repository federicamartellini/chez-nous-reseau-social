# Chez Nous - Réseau Social d'Immeuble

## 📋 Description

**Chez Nous** est une plateforme de réseau social dédiée aux résidents d'un immeuble, favorisant la communication et l'entraide entre voisins. Cette application web permet aux habitants de se connecter, d'échanger des messages, de partager des informations importantes et de créer une véritable communauté au sein de leur résidence.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion sécurisée des résidents
- Gestion des profils utilisateurs
- Système d'authentification par appartement

### 💬 Communication
- **Chat en temps réel** : Messagerie instantanée avec Socket.io
- **Messages privés dans la page profil personnelle** : Communication personnelle 
- **Messages dans la page profil entre amis** : Discussions communautaires
- **Notifications du chat** : Alertes en temps réel pour les nouveaux messages du chat
- **🔔 Notifications visuelles avancées** : Badges compteurs avec clignotements pour messages non lus

### 👥 Gestion des Relations
- **Système d'amis** : Ajout et gestion des contacts des membres 
- **Filtrage des contacts** : Organisation des relations
- **Profils des résidents** : Informations sur les voisins

### 📊 Fonctionnalités Communautaires
- **Topics de discussion** : Sujets organisés (jardinage, coup de coeur, sorties chiens, etc.)
- **Messages à la une** : Annonces importantes
- **Historique des conversations** : Sauvegarde et consultation des échanges

### 📱 Interface Responsive
- Design adaptatif pour mobile, tablette et desktop
- Interface moderne avec grille Bento
- Navigation intuitive avec menu burger mobile
- Optimisation UX/UI pour tous les appareils

### 🏗️ Architecture Modulaire
- **Architecture modulaire** : Code JavaScript organisé en modules séparés
- **Chargement asynchrone** : Scripts chargés de manière optimisée
- **Gestion d'erreurs** : Système robuste de gestion des erreurs 
- **Socket.io intégré** : Communication temps réel avec gestion de reconnexion automatique

### 🔧 Fonctionnalités Techniques Avancées
- **Anti-récursion** : Protection contre les boucles infinites dans le chat
- **Gestion des états** : Synchronisation des données entre modules
- **LocalStorage intelligent** : Persistance des données utilisateur
- **Notifications visuelles** : Badges et compteurs de messages non lus
- **Validation robuste** : Validation côté client et serveur

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** : Environnement d'exécution JavaScript
- **Express.js** : Framework web pour Node.js
- **Socket.io** : Communication en temps réel
- **MongoDB** : Base de données NoSQL avec Mongoose
- **CORS** : Gestion des requêtes cross-origin

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Stylisation moderne et responsive
- **JavaScript ES6+** : Interactivité côté client
- **Socket.io Client** : Communication temps réel côté client

### Outils de Développement
- **Nodemon** : Rechargement automatique en développement
- **dotenv** : Gestion des variables d'environnement

## 📁 Structure du Projet

```
cheznous/
├── .git/                             # Contrôle de version Git
├── .vscode/                          # Configuration VS Code
├── assets/                           # Ressources statiques
│   ├── icons/                        # Icônes de l'application
│   └── images/                       # Images et photos
│       
├── Backend/
│   ├── package.json                  # Dépendances et scripts Node.js
│   └── src/
│       ├── app.js                    # Point d'entrée de l'application
│       ├── config/
│       │   └── database.js           # Configuration MongoDB
│       ├── models/
│       │   ├── abitante.js           # Modèle des résidents
│       │   └── chatmessage.js        # Modèle des messages du chat
│       ├── public/                   # Fichiers statiques servis par Express
│       │   ├── debug-config.js       # Configuration debug pour DevTools
│       │   ├── index.html            # Interface utilisateur principale
│       │   ├── script.js             # JavaScript côté client principal
│       │   ├── style.css             # Feuilles de style CSS
│       │   └── modules/              # Modules JavaScript modulaires
│       │       ├── amis.js           # Gestion des amis et relations
│       │       ├── app-init.js       # Initialisation de l'application
│       │       ├── chat.js           # Module chat en temps réel
│       │       ├── forms-manager.js  # Gestionnaire de formulaires
│       │       ├── historique.js     # Gestion de l'historique
│       │       ├── messages.js       # Gestion des messages
│       │       ├── navigation.js     # Navigation et menu
│       │       ├── profil.js         # Gestion du profil utilisateur
│       │       ├── simple-forms-manager.js # Gestionnaire de formulaires 
│       │       └── validation.js     # Validation des données
│       └── routes/                   # Routes API Express
│           ├── chat.js               # API pour le chat en temps réel
│           ├── friends.js            # API pour la gestion des amis
│           ├── index.js              # Routes principales
│           ├── log.js                # API pour les logs système
│           ├── messages.js           # API pour les messages généraux
│           ├── messagespersonnels.js # API messages personnels
│           ├── messagesprives.js     # API messages privés
│           └── users.js              # API gestion utilisateurs
└── README.md                         # Documentation du projet
```

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** (version 14 ou supérieure)
- **MongoDB** (local ou cloud)
- **npm** (gestionnaire de paquets Node.js)

### Étapes d'installation

1. **Cloner le repository**

   ```bash
   git clone [URL_DU_REPO]
   cd cheznous
   ```

2. **Installer les dépendances**

   ```bash
   cd Backend
   npm install
   ```

3. **Configuration de l'environnement**

   Créer un fichier `.env` dans le dossier `Backend/` :

   ```env
   PORT=***
   MONGODB_URI=mongodb://<username>:<password>@localhost:27017/<dbname>
   NODE_ENV=development
   ```

4. **Démarrer MongoDB**

   MongoDB doit être en cours d'exécution.

5. **Lancer l'application**

   Dans le dossier `Backend`, exécutez :

   ```bash
   npm start
   ```

6. **Accéder à l'application**

   **🌍 En Production** : `https://chez-nous-reseau-social.onrender.com`  
   **🖥️ En Développement** : `http://localhost:5000`

### ⚡ Démarrage rapide avec VS Code

Le projet inclut une tâche VS Code pour démarrer rapidement le serveur :

- Ouvrir le projet dans VS Code
- Aller dans **Terminal > Exécuter la tâche**
- Sélectionner **"Lancer le serveur Chez Nous"**
- Le serveur démarrera automatiquement en arrière-plan

## 🖥️ Utilisation

### Pour les Résidents
1. **Inscription** : Créer un compte
2. **Connexion** : Se connecter avec vos identifiants
3. **Chat** : Participer aux discussions entre amis
4. **Amis** : Ajouter vos voisins comme amis
5. **Topics** : Participer aux discussions thématiques

### Pour les Administrateurs
- Gestion des utilisateurs
- Modération des messages
- Configuration des topics de discussion
- Accès aux logs système

## 🌐 API Endpoints

> **🌍 URL de Production** : `https://chez-nous-reseau-social.onrender.com`  
> **🖥️ URL de Développement** : `http://localhost:5000`

### Authentification
- `POST https://chez-nous-reseau-social.onrender.com/users/register` - Inscription d'un nouvel utilisateur
- `POST https://chez-nous-reseau-social.onrender.com/users/login` - Connexion utilisateur
- `GET https://chez-nous-reseau-social.onrender.com/users/profile` - Récupération du profil utilisateur

### Messages sur Profils
- `POST https://chez-nous-reseau-social.onrender.com/messages/profil-ami` - Publier un message sur le profil d'un ami
- `GET https://chez-nous-reseau-social.onrender.com/messages/profil/:profilId` - Récupérer les messages d'un profil
- `DELETE https://chez-nous-reseau-social.onrender.com/messages/profil/:messageId` - Supprimer un message de profil
- `GET https://chez-nous-reseau-social.onrender.com/messages/admin/tous-messages` - [Admin] Récupérer tous les messages
- `DELETE https://chez-nous-reseau-social.onrender.com/messages/admin/supprimer-message/:messageId` - [Admin] Supprimer un message

### Messages Personnels  
- `GET https://chez-nous-reseau-social.onrender.com/api/messagespersonnels` - Messages personnels du profil utilisateur
- `GET https://chez-nous-reseau-social.onrender.com/api/messagesprives` - Messages privés entre utilisateurs

### Chat en Temps Réel
- `GET https://chez-nous-reseau-social.onrender.com/api/chat/` - Interface de chat
- `POST https://chez-nous-reseau-social.onrender.com/api/chat/envoyer` - Envoyer un message chat avec notifications
- `GET https://chez-nous-reseau-social.onrender.com/api/chat/messages` - Récupérer tous les messages chat
- `GET https://chez-nous-reseau-social.onrender.com/api/chat/messages/:userId/:amiId` - Conversation entre deux utilisateurs
- `GET https://chez-nous-reseau-social.onrender.com/api/chat/messages-non-lus/:userId` - Messages non lus pour un utilisateur
- `POST https://chez-nous-reseau-social.onrender.com/api/chat/marquer-comme-lus` - Marquer des messages comme lus

### Gestion des Amis
- `GET https://chez-nous-reseau-social.onrender.com/friends/membres` - Liste de tous les membres (sauf soi-même)
- `GET https://chez-nous-reseau-social.onrender.com/friends/amis` - Liste des amis confirmés
- `GET https://chez-nous-reseau-social.onrender.com/friends/demandes-envoyees` - Demandes d'amitié envoyées
- `GET https://chez-nous-reseau-social.onrender.com/friends/demandes-recues` - Demandes d'amitié reçues
- `POST https://chez-nous-reseau-social.onrender.com/friends/demander` - Envoyer une demande d'amitié
- `POST https://chez-nous-reseau-social.onrender.com/friends/accepter` - Accepter une demande d'amitié
- `DELETE https://chez-nous-reseau-social.onrender.com/friends/supprimer/:id` - Supprimer un ami

### Logs et Monitoring
- `POST https://chez-nous-reseau-social.onrender.com/api/log` - Enregistrer les actions côté client

### Socket.IO Events (temps réel)
- **URL Socket** : `https://chez-nous-reseau-social.onrender.com`
- **Connexion** : `connection` - Nouvelle connexion utilisateur
- **Enregistrement** : `register user` - Enregistrer un utilisateur connecté
- **Messages chat** : `message` - Recevoir/envoyer des messages
- **Statuts** : `user-connected`, `user-disconnected` - États de connexion
- **Notifications** : `nouveau-message-chat` - Notification de nouveau message

## 🔧 Configuration Avancée

### Variables d'Environnement

**🖥️ Développement Local :**
```env
# Serveur
PORT=***
HOST=localhost

# Base de données
MONGODB_URI=mongodb://<username>:<password>@localhost:27017/<dbname>
DB_NAME=***

# Sécurité
JWT_SECRET=***
SESSION_SECRET=***

# CORS
CORS_ORIGIN=http://localhost:5000
```

**🌍 Production (Render) :**
```env
# Serveur
PORT=***
NODE_ENV=production

# Base de données (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
DB_NAME=***

# Sécurité
JWT_SECRET=***
SESSION_SECRET=***

# CORS
CORS_ORIGIN=https://chez-nous-reseau-social.onrender.com
```

### Configuration MongoDB
La base de données utilise est `france` . Collections principales :
- `abitanti` : Profils des résidents
- `chatmessages` : Messages du chat
- `messagespersonnels` : Messages personnels dans la page profil personnel du résident
- `messagesprofils` : Messages publiés dans la page profil entre amis pour les discussions communautaires
- `test` : Collection de test

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :

- **Mobile** : Smartphones (320px et plus)
- **Tablette** : iPad et tablettes (768px et plus)
- **Desktop** : Ordinateurs (1024px et plus)
- **Large Desktop** : Grands écrans (1440px et plus)

## 🆕 Nouveautés et Améliorations

### Version Actuelle (Juillet 2025)

## 📄 License

Ce projet est un projet de d'école, de fin d'étude pour le certificat de Développement Full-Stack à l'Ifocop. 

## 👥 Équipe

- **Développement** : [Federica Martellini]
- **Institution** : Ifocop - Formation Développement Full-Stack
- **Période** : 2024-2025

**Chez Nous** - Créer du lien social entre voisins 🏠❤️
