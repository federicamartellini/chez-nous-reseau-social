// ========================================
// 💬 MODULE MESSAGES OPTIMISÉ
// Gestion des messages personnels et des amis
// ========================================

console.log("🚀 [MESSAGES] === MODULE MESSAGES CHARGÉ ===");
console.log("💬 [TERMINAL] Initialisation système gestion messages");

// ========================================
// 📋 VARIABLES GLOBALES MESSAGES
// ========================================
let messagesPersonnelsChargés = false;
let messagesAmisChargés = false;

// ========================================
// 💾 SAUVEGARDE MESSAGE PERSONNEL
// ========================================
async function sauvegarderMessagePersonnel() {
    console.log("🎯 [MESSAGES] === DÉBUT SAUVEGARDE MESSAGE PERSONNEL OPTIMISÉ ===");
    console.log("💾 [TERMINAL] Action utilisateur : Publication message profil personnel");
    console.log("📍 [TERMINAL] Collection cible : MongoDB localhost:27017 > france > messagespersonnels");
    
    const messageTextarea = document.getElementById('messagePersonnel');
    const message = messageTextarea ? messageTextarea.value : '';
    
    console.log("📝 [TERMINAL] Contenu message utilisateur:");
    console.log(`   └── Longueur : ${message.length} caractères`);
    console.log(`   └── Aperçu : "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    // Validation contenu
    if (!message.trim()) {
        console.log("⚠️ [MESSAGES] VALIDATION ÉCHEC - Message vide ou espaces uniquement");
        console.log("🚫 [TERMINAL] Opération annulée - contenu invalide");
        alert("Veuillez saisir un message avant de publier dans votre profil.");
        return;
    }
    
    // Vérification authentification
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    const userPrenom = user.prenom || "Utilisateur";
    const userNom = user.nom || "";
    
    console.log("🔐 [MESSAGES] AUTHENTIFICATION - Contrôle accès utilisateur");
    console.log(`   ├── userId récupéré : ${userId}`);
    console.log(`   ├── Nom utilisateur : ${userPrenom} ${userNom}`);
    console.log(`   └── Source localStorage : ${localStorage.getItem('user') ? 'PRÉSENT' : 'ABSENT'}`);
    
    if (!userId) {
        console.log("❌ [MESSAGES] ERREUR CRITIQUE - Session utilisateur invalide");
        console.log("🚫 [TERMINAL] Impossible de publier - authentification échouée");
        alert("Erreur de session. Veuillez vous reconnecter pour publier dans votre profil.");
        return;
    }
    
    // Préparation données
    const timestamp = new Date();
    const messageData = { 
        proprietaire: userId, 
        message: message.trim(),
        date: timestamp.toISOString()
    };
    
    console.log("📦 [MESSAGES] PRÉPARATION DONNÉES - Structure message à envoyer");
    console.log(`   ├── proprietaire : ${messageData.proprietaire}`);
    console.log(`   ├── message : "${messageData.message.substring(0, 30)}..."`);
    console.log(`   └── date : ${messageData.date}`);
    
    try {
        console.log("🌐 [MESSAGES] TRANSMISSION HTTP - Envoi vers API messagespersonnels");
        console.log("🔧 [TERMINAL] Méthode : POST | Content-Type : application/json");
        
        const res = await fetch('http://localhost:5000/api/messagespersonnels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        
        console.log("📊 [MESSAGES] RÉPONSE SERVEUR - Analyse retour HTTP");
        console.log(`   ├── Statut HTTP : ${res.status} ${res.statusText}`);
        console.log(`   ├── Réussite : ${res.ok ? 'OUI' : 'NON'}`);
        console.log(`   └── Type réponse : ${res.headers.get('content-type')}`);
        
        if (res.ok) {
            const responseData = await res.json();
            console.log("✅ [MESSAGES] SUCCÈS COMPLET - Message personnel publié avec succès");
            console.log("💾 [TERMINAL] Stockage confirmé dans MongoDB messagespersonnels");
            console.log("📥 [TERMINAL] Réponse serveur :", responseData);
            console.log(`🎉 [TERMINAL] Message de ${userPrenom} ajouté à son profil personnel`);
            
            // Interface utilisateur - feedback visuel
            messageTextarea.value = "";
            messageTextarea.placeholder = "✅ Message publié avec succès ! Écrivez votre prochain message...";
            
            setTimeout(() => {
                messageTextarea.placeholder = "Publie ton message dans ta page profil";
            }, 3000);
            
            alert("✅ Message publié avec succès dans votre profil !");
            
            // Sauvegarder dans historique
            if (window.HistoriqueModule) {
                window.HistoriqueModule.sauvegarderPersonnel(message.trim());
            }
            
        } else {
            console.log("❌ [MESSAGES] ERREUR HTTP - Échec publication");
            console.log(`💥 [TERMINAL] Erreur serveur : ${res.status} - ${res.statusText}`);
            const errorData = await res.text();
            console.log(`📋 [TERMINAL] Détails erreur : ${errorData}`);
            alert("❌ Erreur lors de la publication dans votre profil. Veuillez réessayer.");
        }
        
    } catch (error) {
        console.log("💥 [MESSAGES] EXCEPTION CRITIQUE - Erreur technique");
        console.log(`🚨 [TERMINAL] Erreur réseau ou serveur : ${error.message}`);
        console.log(`📋 [TERMINAL] Stack trace : ${error.stack}`);
        alert("💥 Erreur de connexion. Vérifiez votre réseau et réessayez.");
    }
    
    // Actualisation automatique
    console.log("🔄 [MESSAGES] ACTUALISATION - Rechargement messages personnels");
    console.log("♻️ [TERMINAL] Mise à jour affichage en cours...");
    
    try {
        await chargerMessagesPersonnels();
        console.log("✅ [TERMINAL] Actualisation réussie - messages à jour");
    } catch (reloadError) {
        console.log(`⚠️ [TERMINAL] Erreur lors du rechargement : ${reloadError.message}`);
    }
    
    console.log("🏁 [MESSAGES] === FIN SAUVEGARDE MESSAGE PERSONNEL OPTIMISÉ ===");
}

// ========================================
// 📥 CHARGEMENT MESSAGES PERSONNELS
// ========================================
async function chargerMessagesPersonnels() {
    console.log("📥 [MESSAGES] === DÉBUT CHARGEMENT MESSAGES PERSONNELS OPTIMISÉ ===");
    console.log("💾 [TERMINAL] Récupération messages personnels utilisateur");
    console.log("📍 [TERMINAL] Source : MongoDB localhost:27017 > france > messagespersonnels");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
        const userPrenom = user.prenom || "Utilisateur";
        
        console.log("👤 [TERMINAL] Authentification utilisateur pour chargement messages personnels");
        console.log(`   ├── userId : ${userId}`);
        console.log(`   ├── Prénom : ${userPrenom}`);
        console.log(`   └── localStorage user : ${localStorage.getItem('user') ? 'PRÉSENT' : 'ABSENT'}`);
        
        if (!userId) {
            console.log("⚠️ [TERMINAL] Pas d'utilisateur connecté - arrêt chargement");
            const zone = document.getElementById('messagesPersonnels');
            if (zone) {
                zone.innerHTML = '<p style="color: orange; font-style: italic;">Connectez-vous pour voir vos messages personnels.</p>';
            }
            return;
        }
        
        console.log("📡 [TERMINAL] Requête HTTP vers API messagespersonnels");
        console.log(`🌐 [TERMINAL] URL : /api/messagespersonnels/${userId}`);
        
        const res = await fetch(`http://localhost:5000/api/messagespersonnels/${userId}`);
        
        console.log("📊 [TERMINAL] Réponse serveur pour messages personnels");
        console.log(`   ├── Statut HTTP : ${res.status}`);
        console.log(`   ├── Réussite : ${res.ok ? 'OUI' : 'NON'}`);
        console.log(`   └── Type contenu : ${res.headers.get('content-type')}`);
        
        if (!res.ok) {
            console.log(`❌ [TERMINAL] Erreur HTTP lors du chargement : ${res.status}`);
            throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
        }
        
        const messages = await res.json();
        
        console.log("📥 [TERMINAL] Messages personnels reçus du serveur");
        console.log(`   ├── Nombre total : ${messages.length} messages`);
        console.log(`   ├── Pour utilisateur : ${userPrenom} (ID: ${userId})`);
        console.log(`   └── Collection source : messagespersonnels`);
        
        // Affichage détaillé des messages
        if (messages.length > 0) {
            console.log("📋 [TERMINAL] Détails messages personnels récupérés :");
            messages.forEach((msg, i) => {
                console.log(`   ${i + 1}. [TERMINAL] Date: ${new Date(msg.date).toLocaleString()} | Message: "${msg.message.substring(0, 30)}..."`);
            });
        } else {
            console.log("📋 [TERMINAL] Aucun message personnel trouvé pour cet utilisateur");
        }
        
        // Rendu HTML
        const zone = document.getElementById('messagesPersonnels');
        if (!zone) return;
        
        if (messages.length === 0) {
            zone.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; padding: 20px;">Aucun message personnel publié. Utilisez le formulaire ci-dessus pour publier votre premier message !</p>';
            console.log("💡 [TERMINAL] Affichage message d'aide - aucun message existant");
        } else {
            // Trier par date (plus récent en premier)
            messages.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            zone.innerHTML = messages.map((msg, index) => {
                const dateFormatee = new Date(msg.date).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return `
                    <div style="border: 2px solid #007bff; padding: 12px; margin: 8px 0; border-radius: 8px; background-color: #f8f9fa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #007bff;">📝 Message #${index + 1}</strong>
                            <small style="color: #6c757d;">🕒 ${dateFormatee}</small>
                        </div>
                        <div style="background-color: white; padding: 10px; border-radius: 6px; border-left: 4px solid #007bff;">
                            ${msg.message}
                        </div>
                    </div>
                `;
            }).join('');
            
            console.log("✅ [TERMINAL] Messages personnels affichés avec style amélioré");
            console.log(`🎨 [TERMINAL] ${messages.length} messages rendus avec formatage date française`);
        }
        
        messagesPersonnelsChargés = true;
        
    } catch (error) {
        console.log('💥 [MESSAGES] EXCEPTION lors du chargement messages personnels');
        console.log(`🚨 [TERMINAL] Erreur technique : ${error.message}`);
        console.log(`📋 [TERMINAL] Stack trace : ${error.stack}`);
        
        const zone = document.getElementById('messagesPersonnels');
        if (zone) {
            zone.innerHTML = '<p style="color: red; font-style: italic; text-align: center; padding: 20px;">❌ Erreur lors du chargement de vos messages personnels. Veuillez actualiser la page.</p>';
        }
    }
    
    console.log("🏁 [MESSAGES] === FIN CHARGEMENT MESSAGES PERSONNELS OPTIMISÉ ===");
}

// ========================================
// 👥 CHARGEMENT MESSAGES AMIS SUR MON PROFIL
// ========================================
async function chargerMessagesAmisProfilMoi() {
    console.log("🚀 [MESSAGES] DÉBUT ACTION - Chargement messages d'amis sur mon profil personnel");
    console.log("📋 [TERMINAL] Tentative récupération messages reçus sur mon profil");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
        
        console.log("👤 [MESSAGES] AUTHENTIFICATION - Vérification utilisateur connecté");
        console.log(`📊 [TERMINAL] user object récupéré:`, user);
        console.log(`🆔 [TERMINAL] userId extrait: ${userId}`);
        
        if (!userId) {
            console.log("⚠️ [MESSAGES] ERREUR SESSION - Aucun utilisateur connecté");
            console.log("🚫 [TERMINAL] Impossible de charger messages - utilisateur non identifié");
            
            const zone = document.getElementById('messagesAmisProfilMoi');
            if (zone) {
                zone.innerHTML = '<p style="color: red; font-style: italic;">Veuillez vous connecter pour voir vos messages.</p>';
            }
            return;
        }
        
        console.log(`📡 [MESSAGES] REQUÊTE HTTP - Appel API vers /messages/profil/${userId}`);
        console.log("🌐 [TERMINAL] Envoi requête pour récupérer messages reçus");
        
        const res = await fetch(`http://localhost:5000/messages/profil/${userId}`);
        
        console.log(`📊 [MESSAGES] RÉPONSE HTTP - Statut reçu du serveur: ${res.status}`);
        console.log(`📡 [TERMINAL] Serveur a répondu avec le statut: ${res.status}`);
        
        if (!res.ok) {
            console.error(`❌ [TERMINAL] Erreur HTTP: ${res.status} ${res.statusText}`);
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const messages = await res.json();
        
        console.log(`📥 [MESSAGES] DONNÉES REÇUES - Nombre de messages d'amis: ${messages.length} messages`);
        console.log("📋 [TERMINAL] Liste des messages récupérée avec succès");
        console.log("🔍 [TERMINAL] Détails des messages reçus:");
        
        // Sauvegarder dans historique
        if (messages.length > 0 && window.HistoriqueModule) {
            window.HistoriqueModule.sauvegarderAmis(messages);
            console.log("📋 [HISTORIQUE] Messages d'amis sauvegardés dans historique local");
        }
        
        // Afficher chaque message dans les logs
        messages.forEach((msg, i) => {
            console.log(`   ${i + 1}. [TERMINAL] De: ${msg.auteurPrenom} ${msg.auteurNom} | Date: ${new Date(msg.date).toLocaleString()} | Message: "${msg.message.substring(0, 30)}..."`);
        });
        
        console.log("🎨 [MESSAGES] MISE À JOUR INTERFACE - Génération affichage HTML");
        console.log("🖥️ [TERMINAL] Création éléments visuels pour interface utilisateur");
        
        const zone = document.getElementById('messagesAmisProfilMoi');
        
        if (messages.length === 0) {
            console.log("📭 [MESSAGES] AUCUN CONTENU - Aucun message à afficher sur le profil");
            console.log("🏳️ [TERMINAL] Aucun message d'ami trouvé sur profil utilisateur");
            zone.innerHTML = '<p style="color: #666; font-style: italic;">Aucun message d\'ami sur votre profil pour le moment.</p>';
        } else {
            console.log(`📝 [MESSAGES] GÉNÉRATION HTML - Création éléments visuels pour ${messages.length} messages`);
            console.log("🔨 [TERMINAL] Construction HTML pour afficher messages");
            
            const contenuHTML = messages.map((message, j) => {
                console.log(`➕ [TERMINAL] Ajout message ${j + 1} de ${message.auteurPrenom} ${message.auteurNom}`);
                
                return `
                    <div style="border: 1px solid #28a745; padding: 12px; margin: 10px 0; border-radius: 6px; background-color: #f8fff8; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #28a745;">💌 ${message.auteurPrenom} ${message.auteurNom} (${message.auteurPseudonyme})</strong>
                            <span style="font-size: 0.85em; color: #666; font-style: italic;">${new Date(message.date).toLocaleString()}</span>
                        </div>
                        <p style="margin: 0; line-height: 1.4; color: #333;">${message.message}</p>
                    </div>
                `;
            }).join('');
            
            zone.innerHTML = contenuHTML;
            console.log("🎉 [TERMINAL] HTML généré et injecté dans interface");
        }
        
        console.log("✅ [MESSAGES] SUCCÈS AFFICHAGE - Messages d'amis affichés avec succès dans interface");
        console.log("🎊 [TERMINAL] Chargement messages terminé avec succès");
        
        messagesAmisChargés = true;
        
    } catch (error) {
        console.error('💥 [MESSAGES] ERREUR CRITIQUE - Échec lors du chargement messages d\'amis:', error.message);
        console.error('📍 [TERMINAL] Erreur complète:', error.stack);
        console.error('🔧 [TERMINAL] Impossible de charger messages du profil');
        
        const zone = document.getElementById('messagesAmisProfilMoi');
        if (zone) {
            zone.innerHTML = '<p style="color: red;">Erreur lors du chargement des messages. Vérifiez la console.</p>';
        }
    }
    
    console.log("🏁 [MESSAGES] FIN ACTION - Chargement messages d'amis sur mon profil terminé");
    console.log("🔚 [TERMINAL] Processus de chargement messages terminé");
}

// ========================================
// 🔄 ACTUALISATION MESSAGES AMIS
// ========================================
function actualiserMessagesAmis() {
    console.log("🔄 [MESSAGES] Bouton actualiser cliqué - Rechargement messages d'amis");
    console.log("🔄 [TERMINAL] Utilisateur demande actualisation messages");
    chargerMessagesAmisProfilMoi();
}

// ========================================
// 🚀 INITIALISATION MODULE MESSAGES
// ========================================
function initialiserMessages() {
    console.log("🚀 [MESSAGES] === DÉBUT INITIALISATION MESSAGES ===");
    console.log("💬 [TERMINAL] Configuration système gestion messages");
    
    try {
        // Configurer bouton sauvegarde message personnel
        const boutonSave = document.getElementById('saveMessagePersonnel');
        if (boutonSave) {
            boutonSave.addEventListener('click', sauvegarderMessagePersonnel);
            console.log("✅ [MESSAGES] Bouton sauvegarde message personnel configuré");
        }
        
        // Configurer bouton actualisation messages amis
        const boutonActualiser = document.getElementById('rafraichirMessagesAmis');
        if (boutonActualiser) {
            boutonActualiser.addEventListener('click', actualiserMessagesAmis);
            console.log("✅ [MESSAGES] Bouton actualisation messages amis configuré");
        }
        
        // Chargement initial si utilisateur connecté
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user._id) {
            console.log("✅ [MESSAGES] Utilisateur connecté - chargement initial messages");
            setTimeout(() => {
                chargerMessagesPersonnels();
                chargerMessagesAmisProfilMoi();
            }, 300);
        } else {
            console.log("⚠️ [MESSAGES] Aucun utilisateur connecté - pas de chargement");
        }
        
        console.log("✅ [MESSAGES] === MESSAGES INITIALISÉS AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Système messages opérationnel");
        
    } catch (error) {
        console.error("💥 [MESSAGES] ERREUR lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation messages:", error.stack);
    }
}

// ========================================
// 📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [MESSAGES] DOM chargé - Lancement messages");
    
    setTimeout(() => {
        initialiserMessages();
    }, 300);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.MessagesModule = {
    initialiser: initialiserMessages,
    sauvegarderPersonnel: sauvegarderMessagePersonnel,
    chargerPersonnels: chargerMessagesPersonnels,
    chargerAmis: chargerMessagesAmisProfilMoi,
    actualiserAmis: actualiserMessagesAmis
};

console.log("✅ [MESSAGES] === MODULE MESSAGES DÉFINI ===");
console.log("🌍 [TERMINAL] Module messages disponible globalement");
