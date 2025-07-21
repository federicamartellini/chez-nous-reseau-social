const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const Abitante = require('../models/abitante');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'france';

// Middleware pour vérifier si l'utilisateur est connecté
function requireUser(req, res, next) {
    req.userId = req.body.userId || req.query.userId;
    if (!req.userId) return res.status(401).json({ message: "Non connecté" });
    next();
}

// Publier un message sur le profil d'un ami
router.post('/profil-ami', requireUser, async (req, res) => {
    const { profilAmiId, message } = req.body;
    console.log("🚀 [SERVEUR] DÉBUT - Publication d'un message sur profil d'ami");
    console.log("📊 [SERVEUR] DONNÉES REÇUES - Payload de la requête POST:", { 
        profilAmiId, 
        message: message?.substring(0, 50) + "...", 
        auteur: req.userId,
        timestamp: new Date().toISOString()
    });

    if (!message || !profilAmiId) {
        console.log("❌ [SERVEUR] ERREUR DE VALIDATION - Champs obligatoires manquants: message ou profilAmiId");
        return res.status(400).json({ message: "Message ou ID du profil ami manquant" });
    }

    try {
        console.log("🔍 [SERVEUR] VÉRIFICATION - Recherche des utilisateurs dans la base de données MongoDB...");
        
        // Vérifier que l'utilisateur et l'ami existent
        const auteur = await Abitante.findById(req.userId);
        const profilAmi = await Abitante.findById(profilAmiId);
        
        console.log("👤 [SERVEUR] VÉRIFICATION AUTEUR - Utilisateur qui publie:", auteur ? `${auteur.prenom} ${auteur.nom} (${auteur.email})` : "❌ NON TROUVÉ dans la collection Abitante");
        console.log("👥 [SERVEUR] VÉRIFICATION DESTINATAIRE - Profil ami ciblé:", profilAmi ? `${profilAmi.prenom} ${profilAmi.nom} (${profilAmi.email})` : "❌ NON TROUVÉ dans la collection Abitante");
        
        if (!auteur || !profilAmi) {
            console.log("❌ [SERVEUR] ERREUR UTILISATEUR - Un ou plusieurs utilisateurs inexistants dans la base de données");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier qu'ils sont bien amis
        console.log("🤝 [SERVEUR] VÉRIFICATION AMITIÉ - Contrôle de la relation d'amitié...");
        console.log("📋 [SERVEUR] DONNÉES AMITIÉ - Liste des amis de l'auteur dans le champ 'amis':", auteur.amis);
        const sontAmis = auteur.amis.includes(profilAmiId);
        console.log("✅ [SERVEUR] RÉSULTAT VÉRIFICATION AMITIÉ - Sont-ils amis confirmés?", sontAmis ? "OUI - Autorisation accordée" : "NON - Accès refusé");
        
        if (!sontAmis) {
            console.log("🚫 [SERVEUR] ERREUR AUTORISATION - Tentative de publication sur profil non-ami refusée");
            return res.status(403).json({ message: "Vous n'êtes pas ami avec cette personne" });
        }

        console.log("💾 [SERVEUR] BASE DE DONNÉES - Connexion à MongoDB collection 'messagesprofils'...");
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagesprofils');
        
        const messageData = {
            profilProprietaire: profilAmiId,  // À qui appartient le profil
            auteur: req.userId,              // Qui a écrit le message
            auteurNom: auteur.nom,
            auteurPrenom: auteur.prenom,
            auteurPseudonyme: auteur.pseudonyme,
            message,
            date: new Date()
        };
        
        console.log("📝 [SERVEUR] PRÉPARATION INSERTION - Document à insérer dans collection 'messagesprofils':", messageData);
        console.log("🗂️ [SERVEUR] COLLECTION CIBLE - Les données vont être stockées dans: mongodb://localhost:27017/france/messagesprofils");
        console.log("📊 [SERVEUR] STRUCTURE DOCUMENT - Champs du message:");
        console.log("   🆔 profilProprietaire:", messageData.profilProprietaire);
        console.log("   👤 auteur:", messageData.auteur);
        console.log("   📝 auteurNom:", messageData.auteurNom);
        console.log("   📝 auteurPrenom:", messageData.auteurPrenom);
        console.log("   📝 auteurPseudonyme:", messageData.auteurPseudonyme);
        console.log("   💬 message:", messageData.message);
        console.log("   📅 date:", messageData.date);
        
        const result = await collection.insertOne(messageData);
        
        console.log("✅ [SERVEUR] SUCCÈS PUBLICATION - Message sur profil d'ami enregistré avec succès dans MongoDB!");
        console.log("🆔 [SERVEUR] IDENTIFIANT GÉNÉRÉ - ID du nouveau message créé:", result.insertedId);
        console.log("🗂️ [SERVEUR] STOCKAGE CONFIRMÉ - Données sauvegardées dans collection 'messagesprofils'");
        await client.close();
        console.log("🔌 [SERVEUR] BASE DE DONNÉES - Connexion MongoDB fermée proprement");
        
        const responseData = { 
            message: "Message publié sur le profil de votre ami", 
            id: result.insertedId 
        };
        console.log("📤 [SERVEUR] RÉPONSE HTTP - Données JSON envoyées au client:", responseData);
        res.json(responseData);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec lors de la publication du message:", err.message);
        console.error("📍 [SERVEUR] DIAGNOSTIC ERREUR - Stack trace complète:", err.stack);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
    console.log("🏁 [SERVEUR] FIN - Publication message sur profil d'ami terminée");
});

// Récupérer les messages publiés sur le profil d'un utilisateur
router.get('/profil/:profilId', async (req, res) => {
    const profilId = req.params.profilId;
    console.log("� [SERVEUR] DÉBUT - Récupération des messages d'un profil utilisateur");
    console.log("🆔 [SERVEUR] PARAMÈTRE URL - ID du profil demandé:", profilId);
    console.log("🕐 [SERVEUR] HORODATAGE - Timestamp de la requête:", new Date().toISOString());

    try {
        console.log("💾 [SERVEUR] BASE DE DONNÉES - Connexion à MongoDB collection 'messagesprofils'...");
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagesprofils');
        
        console.log("📋 [SERVEUR] REQUÊTE MONGO - Recherche messages avec profilProprietaire =", profilId);
        console.log("🗂️ [SERVEUR] COLLECTION SOURCE - Lecture depuis: mongodb://localhost:27017/france/messagesprofils");
        
        // Récupérer tous les messages sur ce profil, triés par date
        const messages = await collection.find({ profilProprietaire: profilId })
            .sort({ date: -1 })
            .toArray();
        
        console.log("📊 [SERVEUR] RÉSULTAT REQUÊTE - Nombre de messages trouvés dans la collection 'messagesprofils':", messages.length);
        console.log("🗂️ [SERVEUR] BASE DE DONNÉES - Collection utilisée: france.messagesprofils");
        console.log("📝 [SERVEUR] APERÇU DONNÉES - Liste des messages récupérés:");
        messages.forEach((msg, index) => {
            console.log(`   ${index + 1}. Auteur: ${msg.auteurPrenom} ${msg.auteurNom} | Date: ${new Date(msg.date).toLocaleString()} | Message: ${msg.message.substring(0, 30)}...`);
        });
        
        await client.close();
        console.log("🔌 [SERVEUR] BASE DE DONNÉES - Connexion MongoDB fermée proprement");
        console.log("📤 [SERVEUR] RÉPONSE HTTP - Envoi du tableau JSON avec", messages.length, "messages au client");
        
        res.json(messages);
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec lors de la récupération des messages:", err.message);
        console.error("📍 [SERVEUR] DIAGNOSTIC ERREUR - Stack trace complète:", err.stack);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
    console.log("🏁 [SERVEUR] FIN - Récupération des messages de profil terminée");
});

// Supprimer un message sur profil (seulement l'auteur ou le propriétaire du profil)
router.delete('/profil/:messageId', requireUser, async (req, res) => {
    const messageId = req.params.messageId;
    console.log("� [SERVEUR] DÉBUT - Suppression d'un message sur profil d'ami");
    console.log("🆔 [SERVEUR] PARAMÈTRE URL - ID du message à supprimer:", messageId);
    console.log("👤 [SERVEUR] AUTHENTIFICATION - Utilisateur demandeur:", req.userId);
    
    try {
        console.log("💾 [SERVEUR] BASE DE DONNÉES - Connexion à MongoDB collection 'messagesprofils'...");
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagesprofils');
        
        console.log("🔍 [SERVEUR] RECHERCHE MESSAGE - Recherche du message avec ObjectId:", messageId);
        
        // Récupérer le message pour vérifier les droits
        const message = await collection.findOne({ _id: new require('mongodb').ObjectId(messageId) });
        
        if (!message) {
            console.log("❌ [SERVEUR] ERREUR RECHERCHE - Message non trouvé avec l'ID:", messageId);
            await client.close();
            return res.status(404).json({ message: "Message non trouvé" });
        }
        
        console.log("✅ [SERVEUR] MESSAGE TROUVÉ - Détails du message à supprimer:");
        console.log("   📝 Auteur du message:", message.auteur);
        console.log("   👤 Propriétaire du profil:", message.profilProprietaire);
        console.log("   📅 Date de création:", new Date(message.date).toLocaleString());
        console.log("   💬 Contenu:", message.message.substring(0, 50) + "...");
        
        // Vérifier que l'utilisateur est soit l'auteur soit le propriétaire du profil
        const estAuteur = message.auteur === req.userId;
        const estProprietaire = message.profilProprietaire === req.userId;
        console.log("🔐 [SERVEUR] VÉRIFICATION AUTORISATION - Contrôle des droits de suppression:");
        console.log("   👨‍💻 Est l'auteur du message?", estAuteur ? "OUI - Peut supprimer" : "NON");
        console.log("   🏠 Est le propriétaire du profil?", estProprietaire ? "OUI - Peut supprimer" : "NON");
        
        if (!estAuteur && !estProprietaire) {
            console.log("🚫 [SERVEUR] ERREUR AUTORISATION - Accès refusé: Ni auteur ni propriétaire du profil");
            await client.close();
            return res.status(403).json({ message: "Vous n'avez pas le droit de supprimer ce message" });
        }
        
        console.log("✅ [SERVEUR] AUTORISATION ACCORDÉE - Droits vérifiés, suppression en cours...");
        await collection.deleteOne({ _id: new require('mongodb').ObjectId(messageId) });
        await client.close();
        console.log("🔌 [SERVEUR] BASE DE DONNÉES - Connexion MongoDB fermée proprement");
        
        console.log("🗑️ [SERVEUR] SUCCÈS SUPPRESSION - Message supprimé définitivement de la collection, ID:", messageId);
        res.json({ message: "Message supprimé" });
        
    } catch (err) {
        console.error("💥 [SERVEUR] ERREUR CRITIQUE - Échec lors de la suppression du message:", err.message);
        console.error("📍 [SERVEUR] DIAGNOSTIC ERREUR - Stack trace complète:", err.stack);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
    console.log("🏁 [SERVEUR] FIN - Suppression de message sur profil terminée");
});

// Récupérer tous les messages pour l'admin
router.get('/admin/tous-messages', requireUser, async (req, res) => {
    console.log("🛡️ [ADMIN] DÉBUT - Récupération de tous les messages pour admin");
    console.log("👤 [ADMIN] AUTHENTIFICATION - Utilisateur demandeur:", req.userId);
    
    try {
        // Vérifier que l'utilisateur est admin
        const admin = await Abitante.findById(req.userId);
        if (!admin || admin.role !== 'admin') {
            console.log("❌ [ADMIN] ACCÈS REFUSÉ - Utilisateur non autorisé:", req.userId);
            return res.status(403).json({ message: "Accès refusé - Droits admin requis" });
        }
        
        console.log("✅ [ADMIN] AUTORISATION - Admin vérifié:", admin.email);
        console.log("💾 [ADMIN] BASE DE DONNÉES - Connexion à MongoDB...");
        
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        
        // Récupérer tous les messages profil
        const messagesProfilCollection = db.collection('messagesprofils');
        const messagesProfil = await messagesProfilCollection.find({}).sort({ dateCreation: -1 }).limit(100).toArray();
        
        console.log("📊 [ADMIN] RÉSULTATS - Messages profil trouvés:", messagesProfil.length);
        
        // Enrichir avec les informations des utilisateurs
        const messagesEnrichis = await Promise.all(messagesProfil.map(async (msg) => {
            const auteur = await Abitante.findById(msg.auteurId);
            const destinataire = await Abitante.findById(msg.profilAmiId);
            
            return {
                _id: msg._id,
                message: msg.message,
                dateCreation: msg.dateCreation,
                type: 'profil',
                auteur: auteur ? `${auteur.nom} ${auteur.prenom} (${auteur.email})` : 'Utilisateur supprimé',
                destinataire: destinataire ? `${destinataire.nom} ${destinataire.prenom} (${destinataire.email})` : 'Utilisateur supprimé'
            };
        }));
        
        client.close();
        
        console.log("✅ [ADMIN] SUCCÈS - Messages enrichis préparés:", messagesEnrichis.length);
        res.json(messagesEnrichis);
        
    } catch (err) {
        console.error("💥 [ADMIN] ERREUR CRITIQUE - Échec récupération messages admin:", err.message);
        console.error("📍 [ADMIN] DIAGNOSTIC ERREUR - Stack trace complète:", err.stack);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
    console.log("🏁 [ADMIN] FIN - Récupération messages admin terminée");
});

// Supprimer un message par l'admin (de n'importe qui)
router.delete('/admin/supprimer-message/:messageId', requireUser, async (req, res) => {
    const messageId = req.params.messageId;
    console.log("🛡️ [ADMIN] DÉBUT - Suppression admin d'un message");
    console.log("🆔 [ADMIN] PARAMÈTRE URL - ID du message à supprimer:", messageId);
    console.log("👤 [ADMIN] AUTHENTIFICATION - Admin demandeur:", req.userId);
    
    try {
        // Vérifier que l'utilisateur est admin
        const admin = await Abitante.findById(req.userId);
        if (!admin || admin.role !== 'admin') {
            console.log("❌ [ADMIN] ACCÈS REFUSÉ - Utilisateur non autorisé:", req.userId);
            return res.status(403).json({ message: "Accès refusé - Droits admin requis" });
        }
        
        console.log("✅ [ADMIN] AUTORISATION - Admin vérifié:", admin.email);
        console.log("💾 [ADMIN] BASE DE DONNÉES - Connexion à MongoDB...");
        
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagesprofils');
        
        // Récupérer le message avant suppression pour les logs
        const message = await collection.findOne({ _id: messageId });
        if (message) {
            console.log("📄 [ADMIN] MESSAGE TROUVÉ - Contenu à supprimer:", message.message.substring(0, 50) + "...");
        }
        
        // Supprimer le message
        const result = await collection.deleteOne({ _id: messageId });
        
        client.close();
        
        if (result.deletedCount > 0) {
            console.log("✅ [ADMIN] SUCCÈS - Message supprimé par admin:", messageId);
            res.json({ message: "Message supprimé par admin" });
        } else {
            console.log("⚠️ [ADMIN] AVERTISSEMENT - Message non trouvé pour suppression:", messageId);
            res.status(404).json({ message: "Message non trouvé" });
        }
        
    } catch (err) {
        console.error("💥 [ADMIN] ERREUR CRITIQUE - Échec suppression admin:", err.message);
        console.error("📍 [ADMIN] DIAGNOSTIC ERREUR - Stack trace complète:", err.stack);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
    console.log("🏁 [ADMIN] FIN - Suppression admin de message terminée");
});

module.exports = router;