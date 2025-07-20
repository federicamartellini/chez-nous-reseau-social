const express = require('express');
const router = express.Router();
const Chat = require('../models/chatmessage');

// Route pour l'espace de chat en temps réel
router.get('/', (req, res) => {
  console.log('GET /chat');
  res.send('Espace de chat en temps réel');
});

// NOUVELLE ROUTE : Envoyer un message chat avec notifications
router.post('/envoyer', async (req, res) => {
    console.log("📤 [SERVEUR] === DEBUT ENVOI MESSAGE CHAT AVEC NOTIFICATIONS ===");
    console.log("🎯 [TERMINAL] Réception d'un nouveau message chat avec système de notifications");
    console.log("📍 [TERMINAL] Cible base de données : MongoDB localhost:27017 > france > chatmessages");
    
    try {
        const { expediteurId, expediteurPrenom, expediteurNom, destinataireId, destinatairePrenom, destinataireNom, message } = req.body;
        
        console.log("📊 [SERVEUR] DONNEES RECUES - Analyse du message entrant :");
        console.log("   📤 [TERMINAL] Expéditeur ID :", expediteurId);
        console.log("   📤 [TERMINAL] Expéditeur nom :", expediteurPrenom, expediteurNom);
        console.log("   📥 [TERMINAL] Destinataire ID :", destinataireId);
        console.log("   📥 [TERMINAL] Destinataire nom :", destinatairePrenom, destinataireNom);
        console.log("   💬 [TERMINAL] Message :", message?.substring(0, 50) + "...");
        
        // Validation des données
        if (!expediteurId || !destinataireId || !message) {
            console.log("❌ [SERVEUR] VALIDATION ECHEC - Données manquantes");
            console.log("🚫 [TERMINAL] Champs requis manquants pour l'envoi du message");
            return res.status(400).json({ message: "Données manquantes pour le message chat" });
        }
        
        console.log("✅ [SERVEUR] VALIDATION REUSSIE - Toutes les données requises présentes");
        
        // Créer le message chat
        const nouveauMessage = new Chat({
            expediteurId: expediteurId,
            expediteurPrenom: expediteurPrenom,
            expediteurNom: expediteurNom,
            destinataireId: destinataireId,
            destinatairePrenom: destinatairePrenom,
            destinataireNom: destinataireNom,
            message: message,
            date: new Date(),
            lu: false // NOUVEAU CHAMP pour marquer si le message a été lu
        });
        
        console.log("📦 [SERVEUR] OBJET CREE - Nouveau message chat préparé pour sauvegarde");
        console.log("💾 [TERMINAL] Objet MongoDB Chat créé avec succès");
        
        // Sauvegarder dans MongoDB
        await nouveauMessage.save();
        
        console.log("✅ [SERVEUR] SAUVEGARDE REUSSIE - Message chat stocké dans MongoDB");
        console.log("🎯 [TERMINAL] Collection chatmessages mise à jour avec succès");
        console.log("📋 [TERMINAL] ID du message sauvegardé :", nouveauMessage._id);
        
        // NOUVEAU : Envoyer notification en temps réel via Socket.IO
        console.log("🔔 [SERVEUR] NOTIFICATION TEMPS REEL - Envoi via Socket.IO");
        console.log("📡 [TERMINAL] Préparation notification pour destinataire");
        
        const io = req.app.get('io');
        const utilisateursConnectes = req.app.get('utilisateursConnectes');
        
        if (io && utilisateursConnectes) {
            console.log("📤 [TERMINAL] Socket.IO disponible - envoi notification");
            
            // Créer les données de notification
            const donneesNotification = {
                expediteurId: expediteurId,
                expediteurPrenom: expediteurPrenom,
                expediteurNom: expediteurNom,
                destinataireId: destinataireId,
                message: message,
                date: nouveauMessage.date,
                messageId: nouveauMessage._id
            };
            
            console.log("📦 [TERMINAL] Données notification préparées pour:", destinataireId);
            
            // Vérifier si le destinataire est connecté
            const destinataireConnecte = utilisateursConnectes.get(destinataireId);
            
            if (destinataireConnecte) {
                console.log("🟢 [TERMINAL] DESTINATAIRE EN LIGNE - Envoi notification immédiate");
                console.log("👤 [TERMINAL] Notification envoyée à:", destinataireConnecte.email);
                
                // Envoyer notification au destinataire
                destinataireConnecte.socket.emit('notification nouveau message chat', donneesNotification);
                
                console.log("🔔 [TERMINAL] Notification 'nouveau_message_chat' envoyée avec succès");
                console.log("📱 [TERMINAL] Le destinataire va recevoir une alerte en temps réel");
            } else {
                console.log("🔴 [TERMINAL] DESTINATAIRE HORS LIGNE - Pas de notification temps réel");
                console.log("💤 [TERMINAL] Utilisateur", destinataireId, "recevra la notification à sa reconnexion");
            }
            
            // Émettre également à tous les clients pour mise à jour générale
            io.emit('nouveau message global', {
                expediteurId: expediteurId,
                destinataireId: destinataireId,
                timestamp: nouveauMessage.date
            });
            
            console.log("📢 [TERMINAL] Notification globale émise pour mise à jour des compteurs");
            
        } else {
            console.log("⚠️ [TERMINAL] Socket.IO non disponible - pas de notification temps réel");
        }
        
        // Réponse succès
        const reponse = { 
            message: "Message chat envoyé avec succès", 
            messageId: nouveauMessage._id,
            timestamp: nouveauMessage.date,
            notificationEnvoyee: !!utilisateursConnectes?.get(destinataireId)
        };
        
        console.log("📤 [SERVEUR] REPONSE ENVOYEE - Confirmation succès renvoyée au client");
        console.log("🎉 [TERMINAL] Message chat traité avec succès + notification");
        
        res.json(reponse);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec envoi message chat :", err.message);
        console.error("📍 [TERMINAL] Erreur complète :", err.stack);
        console.error("🚨 [TERMINAL] Impossible de sauvegarder le message dans chatmessages");
        
        res.status(500).json({ message: "Erreur serveur lors de l'envoi du message" });
    }
    
    console.log("🏁 [SERVEUR] === FIN ENVOI MESSAGE CHAT AVEC NOTIFICATIONS ===");
});

// NOUVELLE ROUTE : Récupérer les messages entre deux utilisateurs
router.get('/messages', async (req, res) => {
    console.log("📥 [SERVEUR] === DEBUT RECUPERATION MESSAGES CHAT ===");
    console.log("🔍 [TERMINAL] Recherche de l'historique de conversation");
    console.log("📍 [TERMINAL] Source : MongoDB localhost:27017 > france > chatmessages");
    
    try {
        const { user1, user2 } = req.query;
        
        console.log("👥 [SERVEUR] PARAMETRES RECUS - IDs des utilisateurs :");
        console.log("   👤 [TERMINAL] Utilisateur 1 :", user1);
        console.log("   👤 [TERMINAL] Utilisateur 2 :", user2);
        
        // Validation des paramètres
        if (!user1 || !user2) {
            console.log("❌ [SERVEUR] VALIDATION ECHEC - IDs utilisateurs manquants");
            console.log("🚫 [TERMINAL] Impossible de récupérer les messages sans les deux IDs");
            return res.status(400).json({ message: "IDs des utilisateurs requis" });
        }
        
        console.log("✅ [SERVEUR] VALIDATION REUSSIE - Recherche des messages dans MongoDB");
        console.log("🔍 [TERMINAL] Requête MongoDB : messages entre " + user1 + " et " + user2);
        
        // Chercher tous les messages entre les deux utilisateurs
        const messages = await Chat.find({
            $or: [
                { expediteurId: user1, destinataireId: user2 },
                { expediteurId: user2, destinataireId: user1 }
            ]
        }).sort({ date: 1 }); // Trier par date croissante
        
        console.log("📊 [SERVEUR] RESULTATS MONGODB - Messages trouvés :", messages.length);
        console.log("📋 [TERMINAL] Conversation récupérée avec succès");
        
        // Log des messages trouvés
        if (messages.length > 0) {
            console.log("💬 [TERMINAL] Aperçu des messages récupérés :");
            for (let i = 0; i < Math.min(messages.length, 5); i++) {
                const msg = messages[i];
                console.log(`   ${i + 1}. [TERMINAL] ${msg.expediteurPrenom} à ${msg.destinatairePrenom} le ${msg.date.toLocaleString()} : "${msg.message.substring(0, 30)}..."`);
            }
            if (messages.length > 5) {
                console.log(`   ... et ${messages.length - 5} autres messages`);
            }
        } else {
            console.log("📭 [TERMINAL] Aucun message trouvé entre ces deux utilisateurs");
        }
        
        console.log("📤 [SERVEUR] ENVOI REPONSE - " + messages.length + " messages renvoyés au client");
        res.json(messages);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec récupération messages :", err.message);
        console.error("📍 [TERMINAL] Erreur complète :", err.stack);
        console.error("🚨 [TERMINAL] Impossible de récupérer les messages de chatmessages");
        
        res.status(500).json({ message: "Erreur serveur lors de la récupération des messages" });
    }
    
    console.log("🏁 [SERVEUR] === FIN RECUPERATION MESSAGES CHAT ===");
});

// NOUVELLE ROUTE : Récupérer messages avec format URL params (alternative)
router.get('/messages/:userId/:amiId', async (req, res) => {
    console.log("📥 [SERVEUR] === DEBUT RECUPERATION MESSAGES CHAT (URL PARAMS) ===");
    console.log("🔍 [TERMINAL] Recherche de l'historique de conversation via URL params");
    console.log("📍 [TERMINAL] Source : MongoDB localhost:27017 > france > chatmessages");
    
    try {
        const { userId, amiId } = req.params;
        
        console.log("👥 [SERVEUR] PARAMETRES URL RECUS - IDs des utilisateurs :");
        console.log("   👤 [TERMINAL] Utilisateur connecté :", userId);
        console.log("   👤 [TERMINAL] Ami sélectionné :", amiId);
        
        // Validation des paramètres
        if (!userId || !amiId) {
            console.log("❌ [SERVEUR] VALIDATION ECHEC - IDs utilisateurs manquants");
            console.log("🚫 [TERMINAL] Impossible de récupérer les messages sans les deux IDs");
            return res.status(400).json({ message: "IDs des utilisateurs requis" });
        }
        
        console.log("✅ [SERVEUR] VALIDATION REUSSIE - Recherche des messages dans MongoDB");
        console.log("🔍 [TERMINAL] Requête MongoDB : messages entre " + userId + " et " + amiId);
        
        // Chercher tous les messages entre les deux utilisateurs
        const messages = await Chat.find({
            $or: [
                { expediteurId: userId, destinataireId: amiId },
                { expediteurId: amiId, destinataireId: userId }
            ]
        }).sort({ date: 1 }); // Trier par date croissante
        
        console.log("📊 [SERVEUR] RESULTATS MONGODB - Messages trouvés :", messages.length);
        console.log("📋 [TERMINAL] Conversation récupérée avec succès");
        
        // Log des messages trouvés
        if (messages.length > 0) {
            console.log("💬 [TERMINAL] Aperçu des messages récupérés :");
            for (let i = 0; i < Math.min(messages.length, 3); i++) {
                const msg = messages[i];
                console.log(`   ${i + 1}. [TERMINAL] ${msg.expediteurPrenom} à ${msg.destinatairePrenom} le ${msg.date.toLocaleString()} : "${msg.message.substring(0, 30)}..."`);
            }
            if (messages.length > 3) {
                console.log(`   ... et ${messages.length - 3} autres messages`);
            }
        } else {
            console.log("📭 [TERMINAL] Aucun message trouvé entre ces deux utilisateurs");
        }
        
        console.log("📤 [SERVEUR] ENVOI REPONSE - " + messages.length + " messages renvoyés au client");
        res.json(messages);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec récupération messages :", err.message);
        console.error("📍 [TERMINAL] Erreur complète :", err.stack);
        console.error("🚨 [TERMINAL] Impossible de récupérer les messages de chatmessages");
        
        res.status(500).json({ message: "Erreur serveur lors de la récupération des messages" });
    }
    
    console.log("🏁 [SERVEUR] === FIN RECUPERATION MESSAGES CHAT (URL PARAMS) ===");
});

// NOUVELLE ROUTE : Compter les messages non lus
router.get('/messages-non-lus/:userId', async (req, res) => {
    console.log("🔢 [SERVEUR] === DEBUT COMPTAGE MESSAGES NON LUS ===");
    console.log("📊 [TERMINAL] Comptage des messages non lus pour notifications");
    console.log("📍 [TERMINAL] Source : MongoDB localhost:27017 > france > chatmessages");
    
    try {
        const { userId } = req.params;
        
        console.log("👤 [SERVEUR] PARAMETRES - Utilisateur ID :", userId);
        
        if (!userId) {
            console.log("❌ [SERVEUR] VALIDATION ECHEC - ID utilisateur manquant");
            return res.status(400).json({ message: "ID utilisateur requis" });
        }
        
        console.log("🔍 [TERMINAL] Recherche messages non lus pour utilisateur:", userId);
        
        // Compter les messages non lus par expéditeur
        const pipeline = [
            {
                $match: {
                    destinataireId: userId,
                    lu: { $ne: true } // Messages non lus
                }
            },
            {
                $group: {
                    _id: "$expediteurId",
                    expediteurPrenom: { $first: "$expediteurPrenom" },
                    expediteurNom: { $first: "$expediteurNom" },
                    nombreNonLus: { $sum: 1 },
                    dernierMessage: { $last: "$message" },
                    derniereDate: { $last: "$date" }
                }
            },
            {
                $sort: { derniereDate: -1 }
            }
        ];
        
        console.log("🔧 [TERMINAL] Pipeline MongoDB pour aggregation des messages non lus");
        
        const messagesNonLus = await Chat.aggregate(pipeline);
        
        console.log("📊 [SERVEUR] RESULTATS - Messages non lus trouvés :", messagesNonLus.length, "expéditeurs");
        console.log("📋 [TERMINAL] Comptage terminé avec succès");
        
        // Log détaillé des résultats
        if (messagesNonLus.length > 0) {
            console.log("💌 [TERMINAL] Détails des messages non lus :");
            for (let i = 0; i < messagesNonLus.length; i++) {
                const item = messagesNonLus[i];
                console.log(`   ${i + 1}. [TERMINAL] De ${item.expediteurPrenom} ${item.expediteurNom}: ${item.nombreNonLus} messages non lus`);
            }
        } else {
            console.log("📭 [TERMINAL] Aucun message non lu pour cet utilisateur");
        }
        
        console.log("📤 [SERVEUR] ENVOI REPONSE - Données de comptage envoyées au client");
        res.json(messagesNonLus);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec comptage messages non lus :", err.message);
        console.error("📍 [TERMINAL] Erreur complète :", err.stack);
        
        res.status(500).json({ message: "Erreur serveur lors du comptage des messages non lus" });
    }
    
    console.log("🏁 [SERVEUR] === FIN COMPTAGE MESSAGES NON LUS ===");
});

// NOUVELLE ROUTE : Marquer les messages comme lus
router.post('/marquer-comme-lus', async (req, res) => {
    console.log("👁️ [SERVEUR] === DEBUT MARQUAGE MESSAGES COMME LUS ===");
    console.log("📖 [TERMINAL] Marquage des messages comme lus pour notifications");
    
    try {
        const { userId, expediteurId } = req.body;
        
        console.log("📊 [SERVEUR] DONNEES RECUES :");
        console.log("   👤 [TERMINAL] Utilisateur (lecteur) :", userId);
        console.log("   📤 [TERMINAL] Expéditeur des messages :", expediteurId);
        
        if (!userId || !expediteurId) {
            console.log("❌ [SERVEUR] VALIDATION ECHEC - Données manquantes");
            return res.status(400).json({ message: "ID utilisateur et expéditeur requis" });
        }
        
        console.log("🔄 [TERMINAL] Mise à jour MongoDB - marquage comme lus");
        
        // Marquer tous les messages de cet expéditeur comme lus
        const resultat = await Chat.updateMany(
            {
                destinataireId: userId,
                expediteurId: expediteurId,
                lu: { $ne: true }
            },
            {
                $set: { 
                    lu: true,
                    dateLecture: new Date()
                }
            }
        );
        
        console.log("✅ [SERVEUR] MARQUAGE REUSSI - Messages marqués comme lus");
        console.log("📊 [TERMINAL] Nombre de messages mis à jour :", resultat.modifiedCount);
        
        // Envoyer notification via Socket.IO si disponible
        const io = req.app.get('io');
        const utilisateursConnectes = req.app.get('utilisateursConnectes');
        
        if (io && utilisateursConnectes && resultat.modifiedCount > 0) {
            const expediteurConnecte = utilisateursConnectes.get(expediteurId);
            
            if (expediteurConnecte) {
                console.log("🔔 [TERMINAL] Notification lecture envoyée à l'expéditeur");
                
                expediteurConnecte.socket.emit('messages marques comme lus', {
                    lecteurId: userId,
                    nombreMessagesLus: resultat.modifiedCount
                });
            }
        }
        
        res.json({ 
            message: "Messages marqués comme lus", 
            nombreMarques: resultat.modifiedCount 
        });
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec marquage messages lus :", err.message);
        console.error("📍 [TERMINAL] Erreur complète :", err.stack);
        
        res.status(500).json({ message: "Erreur serveur lors du marquage" });
    }
    
    console.log("🏁 [SERVEUR] === FIN MARQUAGE MESSAGES COMME LUS ===");
});

// Route existante pour compatibilité
router.post('/', async (req, res) => {
    console.log("⚠️ [SERVEUR] ROUTE OBSOLETE - Utilisation de l'ancienne route POST /chat");
    console.log("💡 [TERMINAL] Suggestion : Migrer vers /chat/envoyer pour de meilleures fonctionnalités");
    
    try {
        const { expediteur, message } = req.body;
        const chatMsg = new Chat({ expediteur, message });
        await chatMsg.save();
        console.log("[SERVEUR] Message de chat sauvegardé (ancienne méthode) :", chatMsg);
        res.json({ message: "Message de chat sauvegardé", chatMsg });
    } catch (err) {
        console.error("[SERVEUR] Erreur sauvegarde chat (ancienne méthode) :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;