const mongoose = require('mongoose');

console.log("📋 [MODELE] === INITIALISATION MODELE CHATMESSAGE ===");
console.log("💾 [TERMINAL] Configuration du schéma MongoDB pour chatmessages");
console.log("📍 [TERMINAL] Base de données cible : MongoDB localhost:27017 > france > chatmessages");

const chatMessageSchema = new mongoose.Schema({
    // Ancien champ pour compatibilité
    expediteur: {
        type: String,
        required: false // Optionnel pour rétrocompatibilité
    },
    
    // NOUVEAUX CHAMPS pour le système de chat amélioré
    expediteurId: {
        type: String,
        required: true
    },
    expediteurPrenom: {
        type: String,
        required: true
    },
    expediteurNom: {
        type: String,
        required: true
    },
    destinataireId: {
        type: String,
        required: true
    },
    destinatairePrenom: {
        type: String,
        required: true
    },
    destinataireNom: {
        type: String,
        required: true
    },
    
    // Champs communs
    message: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    
    // NOUVEAUX CHAMPS pour les notifications
    lu: {
        type: Boolean,
        default: false
    },
    dateLecture: {
        type: Date,
        required: false
    }
});

console.log("✅ [MODELE] SCHEMA DEFINI - Structure ChatMessage configurée");
console.log("📊 [TERMINAL] Champs du modèle :");
console.log("   📤 [TERMINAL] expediteurId, expediteurPrenom, expediteurNom");
console.log("   📥 [TERMINAL] destinataireId, destinatairePrenom, destinataireNom");
console.log("   💬 [TERMINAL] message, date");
console.log("   � [TERMINAL] lu, dateLecture (notifications)");
console.log("   �🔄 [TERMINAL] expediteur (rétrocompatibilité)");

// Index pour optimiser les requêtes de conversation
chatMessageSchema.index({ expediteurId: 1, destinataireId: 1, date: 1 });
// NOUVEL INDEX pour les messages non lus
chatMessageSchema.index({ destinataireId: 1, lu: 1, date: 1 });

console.log("🔍 [MODELE] INDEX CREE - Optimisation des requêtes de conversation");
console.log("⚡ [TERMINAL] Index MongoDB configuré pour expediteurId + destinataireId + date");

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema, 'chatmessages');

console.log("🎯 [MODELE] MODELE EXPORTE - ChatMessage prêt pour utilisation");
console.log("🏁 [TERMINAL] === FIN INITIALISATION MODELE CHATMESSAGE ===");

module.exports = ChatMessage;