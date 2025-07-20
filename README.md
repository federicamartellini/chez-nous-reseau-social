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
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/france
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

   Ouvrez votre navigateur et rendez-vous sur : `http://localhost:5000`

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

### Authentification
- `POST /users/register` - Inscription d'un nouvel utilisateur
- `POST /users/login` - Connexion utilisateur
- `GET /users/profile` - Récupération du profil

### Messages
- `GET /messages` - Récupération des messages
- `POST /messages` - Envoi d'un nouveau message
- `GET /api/messagespersonnels` - Messages personnels
- `GET /api/messagesprives` - Messages privés

### Chat
- `GET /chat` - Interface de chat
- Socket events : `message`, `user-connected`, `user-disconnected`

### Amis
- `GET /friends` - Liste des amis
- `POST /friends/add` - Ajouter un ami
- `DELETE /friends/remove` - Supprimer un ami

## 🔧 Configuration Avancée

### Variables d'Environnement
```env
# Serveur
PORT=5000
HOST=localhost

# Base de données
MONGODB_URI=mongodb://localhost:27017/france
DB_NAME=france

# Sécurité
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# CORS
CORS_ORIGIN=http://localhost:5000
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
