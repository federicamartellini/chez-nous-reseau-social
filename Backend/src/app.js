const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const indexRoutes = require('./routes/index');
const messagesRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const friendsRoutes = require('./routes/friends');
const messagesprivesRouter = require('./routes/messagesprives');
const path = require('path');
require('dotenv').config(); // Pour charger les variables d'environnement
require('./config/database'); // Connexion mongoose (doit être AVANT les modèles)
const mongoose = require('mongoose');

// Utilisation de la base france
const dbName = 'france';

// Configuration
const app = express();
const httpServer = createServer(app);

// Middleware CORS avec support production
app.use(cors({
    origin: [
        "http://localhost:5000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5000",
        "https://chez-nous-reseau-social.onrender.com"
    ],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
console.log('Fichiers statiques configurés');

// Middlewares JSON
app.use(express.json());

// Routes
app.use('/', indexRoutes);
console.log('Routes d\'accueil configurées');
app.use('/users', require('./routes/users'));
console.log('Routes utilisateurs configurées');
app.use('/messages', messagesRoutes);
console.log('Routes messagerie privée configurées');
app.use('/api/chat', chatRoutes);
console.log('Routes chat configurées');
app.use('/friends', friendsRoutes);
console.log('Routes amis configurées');
app.use('/api/messagesprives', messagesprivesRouter);
console.log('Routes messagerie privées configurées');
app.use('/api/log', require('./routes/log'));
app.use('/api/messagespersonnels', require('./routes/messagespersonnels'));
console.log('Routes messages personnels configurées');

// Route temporaire pour déboguer la base de données
app.get('/debug/database-info', async (req, res) => {
    try {
        const Abitante = require('./models/abitante');
        
        // Informations de connexion
        const dbName = mongoose.connection.name;
        const connectionState = mongoose.connection.readyState;
        
        // Compter les documents
        const totalMembres = await Abitante.countDocuments();
        
        // Exemples de membres
        const exemplesMembres = await Abitante.find({}, {
            nom: 1,
            prenom: 1, 
            pseudonyme: 1,
            email: 1,
            role: 1,
            region: 1,
            amis: 1,
            demandesEnvoyees: 1,
            demandesRecues: 1
        }).limit(5);
        
        // Statistiques par rôle
        const statsRoles = await Abitante.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        // Statistiques par région  
        const statsRegions = await Abitante.aggregate([
            { $group: { _id: '$region', count: { $sum: 1 } } }
        ]);
        
        const info = {
            database: {
                name: dbName,
                connectionState: connectionState, // 1 = connected
                isAtlas: process.env.MONGODB_URI ? process.env.MONGODB_URI.includes('mongodb.net') : false,
                uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Non défini'
            },
            collections: {
                abitanti: {
                    total: totalMembres,
                    statsRoles,
                    statsRegions,
                    exemples: exemplesMembres
                }
            },
            timestamp: new Date().toISOString()
        };
        
        res.json(info);
        
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
console.log('Route debug database configurée');

// Socket.IO events
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5000",
            "https://chez-nous-reseau-social.onrender.com"
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: false
    },
    transports: ['polling', 'websocket']
});

console.log("🔌 [SOCKET] === INITIALISATION SOCKET.IO POUR NOTIFICATIONS CHAT ===");
console.log("💬 [TERMINAL] Configuration des événements en temps réel pour le chat");

// Stockage des utilisateurs connectés
var utilisateursConnectes = new Map();

io.on('connection', (socket) => {
    console.log('👤 [SOCKET] Nouveau client connecté, ID:', socket.id);
    console.log('🔌 [TERMINAL] Connexion socket établie pour notifications chat');

    // Enregistrement d'un utilisateur
    socket.on('register user', (user) => {
        console.log("📝 [SOCKET] ENREGISTREMENT UTILISATEUR - Inscription pour notifications");
        console.log("👤 [TERMINAL] Utilisateur s'inscrit:", user.email, "ID:", user._id);
        
        socket.user = user;
        socket.userId = user._id;
        
        // Stocker dans la map des utilisateurs connectés
        utilisateursConnectes.set(user._id, {
            socketId: socket.id,
            socket: socket,
            email: user.email,
            prenom: user.prenom,
            nom: user.nom,
            connecteDepuis: new Date()
        });
        
        console.log('📍 [SOCKET] Utilisateur enregistré pour notifications:', user.email);
        console.log('💾 [TERMINAL] Stocké dans utilisateursConnectes, total:', utilisateursConnectes.size, 'utilisateurs');
        
        // LOG VISIBLE POUR CONNEXION
        console.log('');
        console.log('🟢 ================================');
        console.log('🟢 MEMBRE CONNECTÉ');
        console.log('🟢 ================================');
        console.log(`🟢 Nom: ${user.nom} ${user.prenom}`);
        console.log(`🟢 Email: ${user.email}`);
        console.log(`🟢 Pseudonyme: ${user.pseudonyme || 'Non défini'}`);
        console.log(`🟢 Région: ${user.region || 'Non définie'}`);
        console.log(`🟢 Heure de connexion: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🟢 Utilisateurs connectés: ${utilisateursConnectes.size}`);
        console.log('🟢 ================================');
        console.log('');
        
        // Joindre une room personnelle pour les notifications
        socket.join('user_' + user._id);
        console.log('🏠 [TERMINAL] Utilisateur ajouté à la room:', 'user_' + user._id);
    });

    // NOUVEAU : Gestion des messages de chat en temps réel
    socket.on('envoyer-message-chat', (messageData) => {
        console.log("📤 [SOCKET] MESSAGE CHAT TEMPS RÉEL - Réception et diffusion");
        console.log("💬 [TERMINAL] De:", messageData.expediteurPrenom, messageData.expediteurNom);
        console.log("📥 [TERMINAL] Vers:", messageData.destinataireId);
        console.log("💌 [TERMINAL] Contenu:", messageData.message.substring(0, 50) + "...");
        
        const messageComplet = {
            expediteurId: messageData.expediteurId,
            expediteurPrenom: messageData.expediteurPrenom,
            expediteurNom: messageData.expediteurNom,
            destinataireId: messageData.destinataireId,
            destinatairePrenom: messageData.destinatairePrenom,
            destinataireNom: messageData.destinataireNom,
            message: messageData.message,
            date: messageData.date
        };
        
        // Vérifier que le destinataire est en ligne
        const destinataireConnecte = utilisateursConnectes.get(messageData.destinataireId);
        
        if (destinataireConnecte) {
            console.log("✅ [SOCKET] DESTINATAIRE EN LIGNE - Diffusion immédiate");
            console.log("🎯 [TERMINAL] Envoi à:", destinataireConnecte.email);
            
            // Envoyer le message au destinataire immédiatement
            destinataireConnecte.socket.emit('nouveau-message-chat', messageComplet);
            
            console.log("⚡ [TERMINAL] Message diffusé au destinataire en temps réel");
        } else {
            console.log("⚠️ [SOCKET] DESTINATAIRE HORS LIGNE");
            console.log("💤 [TERMINAL] Utilisateur", messageData.destinataireId, "recevra le message à la reconnexion");
        }
        
        // IMPORTANT : Renvoyer aussi le message à l'expéditeur pour qu'il l'affiche dans son interface
        const expediteurConnecte = utilisateursConnectes.get(messageData.expediteurId);
        if (expediteurConnecte) {
            console.log("🔄 [SOCKET] RENVOI À L'EXPÉDITEUR - Confirmation d'affichage");
            expediteurConnecte.socket.emit('nouveau-message-chat', messageComplet);
            console.log("⚡ [TERMINAL] Message renvoyé à l'expéditeur pour affichage");
        }
        
        // Confirmer la réception à l'expéditeur
        socket.emit('message-envoye-confirmation', {
            success: true,
            messageId: messageData.date, // Utiliser la date comme ID temporaire
            destinataireEnLigne: !!destinataireConnecte
        });
    });

    // NOUVEAU : Notification d'envoi de message chat (événement unifié)
    socket.on('nouveau message chat', (donneesMessage) => {
        console.log("📤 [SOCKET] NOUVEAU MESSAGE CHAT - Notification en temps réel");
        console.log("💬 [TERMINAL] Message envoyé par:", donneesMessage.expediteurPrenom, donneesMessage.expediteurNom);
        console.log("📥 [TERMINAL] Destinataire:", donneesMessage.destinataireId);
        console.log("💌 [TERMINAL] Contenu:", donneesMessage.message.substring(0, 30) + "...");
        
        // Envoyer notification au destinataire s'il est connecté
        var destinataireConnecte = utilisateursConnectes.get(donneesMessage.destinataireId);
        
        if (destinataireConnecte) {
            console.log("✅ [SOCKET] DESTINATAIRE EN LIGNE - Envoi notification");
            console.log("🎯 [TERMINAL] Notification envoyée à:", destinataireConnecte.email);
            
            // Envoyer la notification via socket
            destinataireConnecte.socket.emit('notification nouveau message chat', {
                expediteurId: donneesMessage.expediteurId,
                expediteurPrenom: donneesMessage.expediteurPrenom,
                expediteurNom: donneesMessage.expediteurNom,
                message: donneesMessage.message,
                date: donneesMessage.date,
                typeNotification: 'nouveau_message_chat'
            });
            
            console.log("🔔 [TERMINAL] Notification 'notification nouveau message chat' envoyée avec succès");
        } else {
            console.log("⚠️ [SOCKET] DESTINATAIRE HORS LIGNE - Notification stockée pour plus tard");
            console.log("💤 [TERMINAL] Utilisateur", donneesMessage.destinataireId, "n'est pas connecté");
        }
    });

    // NOUVEAU : Marquer les messages comme lus
    socket.on('messages lus', (donneesLecture) => {
        console.log("👁️ [SOCKET] MESSAGES LUS - Marquer comme lus");
        console.log("📖 [TERMINAL] Utilisateur", socket.userId, "a lu les messages de", donneesLecture.expediteurId);
        
        // Notifier l'expéditeur que ses messages ont été lus
        var expediteurConnecte = utilisateursConnectes.get(donneesLecture.expediteurId);
        
        if (expediteurConnecte) {
            expediteurConnecte.socket.emit('messages marques comme lus', {
                lecteurId: socket.userId,
                lecteurPrenom: socket.user.prenom,
                lecteurNom: socket.user.nom,
                nombreMessagesLus: donneesLecture.nombreMessages
            });
            
            console.log("✅ [TERMINAL] Notification 'messages_lus' envoyée à l'expéditeur");
        }
    });

    // Gestion de la déconnexion manuelle (via bouton déconnexion)
    socket.on('manual disconnect', (data) => {
        console.log("🔴 [SOCKET] DÉCONNEXION MANUELLE - Bouton déconnexion cliqué");
        
        if (socket.user && socket.user.email) {
            // LOG VISIBLE POUR DÉCONNEXION MANUELLE
            console.log('');
            console.log('🔴 ================================');
            console.log('🔴 MEMBRE DÉCONNECTÉ (MANUEL)');
            console.log('🔴 ================================');
            console.log(`🔴 Nom: ${socket.user.nom} ${socket.user.prenom}`);
            console.log(`🔴 Email: ${socket.user.email}`);
            console.log(`🔴 Pseudonyme: ${socket.user.pseudonyme || 'Non défini'}`);
            console.log(`🔴 Heure de déconnexion: ${new Date().toLocaleString('fr-FR')}`);
            console.log(`🔴 Type: Déconnexion volontaire`);
            
            // Supprimer de la map
            utilisateursConnectes.delete(socket.userId);
            
            console.log(`🔴 Utilisateurs restants: ${utilisateursConnectes.size}`);
            console.log('🔴 ================================');
            console.log('');
            
            console.log('🚪 [TERMINAL] Déconnexion manuelle traitée pour:', socket.user.email);
        }
        
        // Déconnecter proprement le socket
        socket.disconnect();
    });

    // Gestion de la déconnexion automatique
    socket.on('disconnect', () => {
        console.log("👋 [SOCKET] DECONNEXION - Nettoyage des notifications");
        
        if (socket.user && socket.user.email) {
            // Vérifier si l'utilisateur est encore dans la map (éviter les doublons avec déconnexion manuelle)
            const existeEncore = utilisateursConnectes.has(socket.userId);
            
            if (existeEncore) {
                // LOG VISIBLE POUR DÉCONNEXION AUTOMATIQUE
                console.log('');
                console.log('🔴 ================================');
                console.log('🔴 MEMBRE DÉCONNECTÉ (AUTO)');
                console.log('🔴 ================================');
                console.log(`🔴 Nom: ${socket.user.nom} ${socket.user.prenom}`);
                console.log(`🔴 Email: ${socket.user.email}`);
                console.log(`🔴 Pseudonyme: ${socket.user.pseudonyme || 'Non défini'}`);
                console.log(`🔴 Heure de déconnexion: ${new Date().toLocaleString('fr-FR')}`);
                console.log(`🔴 Type: Déconnexion automatique`);
                
                console.log(`🚪 [TERMINAL] ${socket.user.email} se déconnecte automatiquement`);
                console.log("🧹 [TERMINAL] Suppression de utilisateursConnectes");
                
                // Supprimer de la map
                utilisateursConnectes.delete(socket.userId);
                
                console.log('👋 [SOCKET] Utilisateur déconnecté:', socket.user.email);
                console.log('💾 [TERMINAL] Utilisateurs restants connectés:', utilisateursConnectes.size);
                
                console.log(`🔴 Utilisateurs restants: ${utilisateursConnectes.size}`);
                console.log('🔴 ================================');
                console.log('');
            } else {
                console.log('ℹ️ [SOCKET] Déconnexion déjà traitée pour:', socket.user.email);
            }
        } else {
            console.log('👋 [SOCKET] Client déconnecté, ID:', socket.id);
        }
    });
});

// Exporter io pour utilisation dans les routes
app.set('io', io);
app.set('utilisateursConnectes', utilisateursConnectes);

console.log("✅ [SOCKET] === CONFIGURATION SOCKET.IO TERMINEE ===");
console.log("🔔 [TERMINAL] Système de notifications chat en temps réel prêt");

// Port d'écoute
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
