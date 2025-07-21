// ========================================
// 🛡️ MODULE ADMINISTRATION CHEZNOUS
// ========================================

console.log("🚀 [ADMIN] === MODULE ADMINISTRATION CHARGÉ ===");
console.log("🛡️ [TERMINAL] Initialisation système gestion admin");

// ========================================
// 📊 VARIABLES GLOBALES ADMIN
// ========================================
let utilisateursListe = [];
let messagesListe = [];
let statistiquesAdmin = {
    totalUsers: 0,
    totalMessages: 0,
    connectedUsers: 0
};

// ========================================
// 🔧 INITIALISATION MODULE ADMIN
// ========================================
function initialiserAdmin() {
    console.log("🚀 [ADMIN] === DÉBUT INITIALISATION ADMIN ===");
    console.log("🛡️ [TERMINAL] Configuration interface administration");
    
    try {
        // Vérifier si l'utilisateur est admin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log("🔍 [ADMIN] Vérification utilisateur:", {
            id: user._id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            prenom: user.prenom
        });
        
        if (!user._id || user.role !== 'admin') {
            console.warn("⚠️ [ADMIN] ACCÈS REFUSÉ - Utilisateur non autorisé");
            console.warn("⚠️ [ADMIN] Rôle requis: 'admin', rôle actuel:", user.role);
            return;
        }
        
        console.log("✅ [ADMIN] ACCÈS AUTORISÉ - Utilisateur admin confirmé");
        
        // Configurer les boutons
        console.log("🔧 [ADMIN] Configuration des boutons admin...");
        configurerBoutonsAdmin();
        
        // Configurer les filtres et recherche
        console.log("🔧 [ADMIN] Configuration des filtres et recherche...");
        configurerFiltresAdmin();
        
        // Charger les données initiales
        console.log("📊 [ADMIN] Chargement des données initiales...");
        chargerDonneesAdmin();
        
        console.log("✅ [ADMIN] === INITIALISATION ADMIN TERMINÉE ===");
        console.log("🛡️ [TERMINAL] Panel administration opérationnel");
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur lors de l'initialisation:", error);
    }
}

// ========================================
// 🎮 CONFIGURATION BOUTONS ADMIN
// ========================================
function configurerBoutonsAdmin() {
    console.log("🎮 [ADMIN] Configuration des boutons administration");
    
    // Bouton actualiser utilisateurs
    const refreshUsersBtn = document.getElementById('refreshUsersAdmin');
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', chargerUtilisateursAdmin);
        console.log("✅ [ADMIN] Bouton actualiser utilisateurs configuré");
    }
    
    // Bouton actualiser messages
    const refreshMessagesBtn = document.getElementById('refreshMessagesAdmin');
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener('click', chargerMessagesAdmin);
        console.log("✅ [ADMIN] Bouton actualiser messages configuré");
    }
    
    // Boutons zone dangereuse
    const cleanupBtn = document.getElementById('cleanupOldMessages');
    if (cleanupBtn) {
        cleanupBtn.addEventListener('click', nettoyerAncienMessages);
        console.log("✅ [ADMIN] Bouton nettoyage configuré");
    }
    
    const exportBtn = document.getElementById('exportUserData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exporterDonnees);
        console.log("✅ [ADMIN] Bouton export configuré");
    }
}

// ========================================
// 🔍 CONFIGURATION FILTRES ET RECHERCHE
// ========================================
function configurerFiltresAdmin() {
    console.log("🔍 [ADMIN] Configuration filtres et recherche");
    
    // Recherche utilisateurs
    const searchUserInput = document.getElementById('searchUserAdmin');
    if (searchUserInput) {
        searchUserInput.addEventListener('input', filtrerUtilisateursAdmin);
        console.log("✅ [ADMIN] Recherche utilisateurs configurée");
    }
    
    // Filtre type de messages
    const filterMessageType = document.getElementById('filterMessageType');
    if (filterMessageType) {
        filterMessageType.addEventListener('change', filtrerMessagesAdmin);
        console.log("✅ [ADMIN] Filtre type messages configuré");
    }
    
    // Recherche messages
    const searchMessageInput = document.getElementById('searchMessageAdmin');
    if (searchMessageInput) {
        searchMessageInput.addEventListener('input', filtrerMessagesAdmin);
        console.log("✅ [ADMIN] Recherche messages configurée");
    }
}

// ========================================
// 📊 CHARGEMENT DONNÉES ADMIN
// ========================================
async function chargerDonneesAdmin() {
    console.log("📊 [ADMIN] Chargement données administration");
    
    try {
        // Charger en parallèle
        await Promise.all([
            chargerStatistiquesAdmin(),
            chargerUtilisateursAdmin(),
            chargerMessagesAdmin()
        ]);
        
        console.log("✅ [ADMIN] Toutes les données admin chargées");
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur chargement données:", error);
    }
}

// ========================================
// 📈 CHARGEMENT STATISTIQUES
// ========================================
async function chargerStatistiquesAdmin() {
    console.log("📈 [ADMIN] Chargement statistiques");
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Récupérer les statistiques depuis l'API
        const response = await fetch(API_CONFIG.url('/friends/membres?userId=' + user._id));
        const users = await response.json();
        
        statistiquesAdmin.totalUsers = users.length;
        
        // Pour les messages, on peut faire une estimation
        statistiquesAdmin.totalMessages = 0; // À implémenter si nécessaire
        statistiquesAdmin.connectedUsers = 0; // À implémenter avec Socket.IO
        
        // Mettre à jour l'affichage
        mettreAJourStatistiquesAffichage();
        
        console.log("✅ [ADMIN] Statistiques chargées:", statistiquesAdmin);
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur chargement statistiques:", error);
    }
}

// ========================================
// 👥 CHARGEMENT UTILISATEURS
// ========================================
async function chargerUtilisateursAdmin() {
    console.log("👥 [ADMIN] Chargement liste utilisateurs");
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Afficher le loading
        const container = document.getElementById('adminUsersList');
        if (container) {
            container.innerHTML = '<div class="loading-admin" style="text-align: center; padding: 20px; color: #6c757d;">📋 Chargement des utilisateurs...</div>';
        }
        
        const response = await fetch(API_CONFIG.url('/friends/membres?userId=' + user._id));
        utilisateursListe = await response.json();
        
        // Afficher les utilisateurs
        afficherUtilisateursAdmin(utilisateursListe);
        
        console.log("✅ [ADMIN] Utilisateurs chargés:", utilisateursListe.length);
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur chargement utilisateurs:", error);
        
        const container = document.getElementById('adminUsersList');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ Erreur chargement utilisateurs</div>';
        }
    }
}

// ========================================
// 💬 CHARGEMENT MESSAGES
// ========================================
async function chargerMessagesAdmin() {
    console.log("💬 [ADMIN] Chargement liste messages");
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Afficher le loading
        const container = document.getElementById('adminMessagesList');
        if (container) {
            container.innerHTML = '<div class="loading-admin" style="text-align: center; padding: 20px; color: #6c757d;">💬 Chargement des messages...</div>';
        }
        
        // Récupérer les messages depuis l'API admin
        const response = await fetch(API_CONFIG.url(`/messages/admin/tous-messages?userId=${user._id}`));
        
        if (response.ok) {
            messagesListe = await response.json();
            statistiquesAdmin.totalMessages = messagesListe.length;
            mettreAJourStatistiquesAffichage();
        } else {
            console.warn("⚠️ [ADMIN] Impossible de charger les messages:", response.status);
            messagesListe = [];
        }
        
        // Afficher les messages
        afficherMessagesAdmin(messagesListe);
        
        console.log("✅ [ADMIN] Messages chargés:", messagesListe.length);
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur chargement messages:", error);
        messagesListe = [];
        
        const container = document.getElementById('adminMessagesList');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ Erreur chargement messages</div>';
        }
    }
}

// ========================================
// 📊 MISE À JOUR AFFICHAGE STATISTIQUES
// ========================================
function mettreAJourStatistiquesAffichage() {
    console.log("📊 [ADMIN] Mise à jour affichage statistiques");
    
    const totalUsersEl = document.getElementById('adminTotalUsers');
    const totalMessagesEl = document.getElementById('adminTotalMessages');
    const connectedUsersEl = document.getElementById('adminConnectedUsers');
    
    if (totalUsersEl) totalUsersEl.textContent = statistiquesAdmin.totalUsers;
    if (totalMessagesEl) totalMessagesEl.textContent = statistiquesAdmin.totalMessages;
    if (connectedUsersEl) connectedUsersEl.textContent = statistiquesAdmin.connectedUsers;
}

// ========================================
// 👤 AFFICHAGE UTILISATEURS ADMIN
// ========================================
function afficherUtilisateursAdmin(users) {
    console.log("👤 [ADMIN] Affichage liste utilisateurs:", users.length);
    
    const container = document.getElementById('adminUsersList');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">👥 Aucun utilisateur trouvé</div>';
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    const html = users.map(user => {
        const isCurrentUser = user._id === currentUser._id;
        const roleIcon = user.role === 'admin' ? '🛡️' : '👤';
        const actionBtn = isCurrentUser ? 
            '<span style="color: #28a745; font-weight: bold;">Vous</span>' :
            `<button onclick="supprimerUtilisateurAdmin('${user._id}', '${user.nom} ${user.prenom}')" 
                     class="btn btn-sm" 
                     style="background: #dc3545; color: white; padding: 4px 8px; font-size: 0.8em;"
                     title="Supprimer cet utilisateur">
                🗑️ Supprimer
            </button>`;
        
        return `
            <div class="user-admin-item" style="border-bottom: 1px solid #e9ecef; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; color: #333;">
                        ${roleIcon} ${user.nom} ${user.prenom}
                    </div>
                    <div style="font-size: 0.9em; color: #6c757d;">
                        📧 ${user.email} | 📱 @${user.pseudonyme || 'Non défini'} | 📍 ${user.region || 'Non définie'}
                    </div>
                    <div style="font-size: 0.8em; color: #007bff;">
                        Rôle: ${user.role === 'admin' ? 'Administrateur' : 'Membre'}
                    </div>
                </div>
                <div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ========================================
// 💬 AFFICHAGE MESSAGES ADMIN
// ========================================
function afficherMessagesAdmin(messages) {
    console.log("💬 [ADMIN] Affichage liste messages:", messages.length);
    
    const container = document.getElementById('adminMessagesList');
    if (!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">💬 Aucun message trouvé</div>';
        return;
    }
    
    const html = messages.map(message => {
        const dateFormatee = new Date(message.dateCreation).toLocaleString('fr-FR');
        const messageAbrege = message.message.length > 100 ? 
            message.message.substring(0, 100) + '...' : 
            message.message;
        
        return `
            <div class="message-admin-item" style="border-bottom: 1px solid #e9ecef; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">
                            💬 ${message.type === 'profil' ? 'Message profil' : 'Message chat'}
                        </div>
                        <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 6px;">
                            👤 De: ${message.auteur} → À: ${message.destinataire}
                        </div>
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; border-left: 3px solid #007bff;">
                            "${messageAbrege}"
                        </div>
                        <div style="font-size: 0.8em; color: #6c757d; margin-top: 4px;">
                            � ${dateFormatee}
                        </div>
                    </div>
                    <button onclick="AdminModule.supprimerMessageAdmin('${message._id}', '${message.auteur}')" 
                            class="btn btn-sm" 
                            style="background: #dc3545; color: white; padding: 4px 8px; font-size: 0.8em; margin-left: 10px;"
                            title="Supprimer ce message">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ========================================
// 🔍 FILTRAGE UTILISATEURS
// ========================================
function filtrerUtilisateursAdmin() {
    const searchTerm = document.getElementById('searchUserAdmin').value.toLowerCase();
    console.log("🔍 [ADMIN] Filtrage utilisateurs:", searchTerm);
    
    if (!searchTerm) {
        afficherUtilisateursAdmin(utilisateursListe);
        return;
    }
    
    const filteredUsers = utilisateursListe.filter(user => 
        user.nom.toLowerCase().includes(searchTerm) ||
        user.prenom.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.pseudonyme && user.pseudonyme.toLowerCase().includes(searchTerm))
    );
    
    afficherUtilisateursAdmin(filteredUsers);
}

// ========================================
// 🔍 FILTRAGE MESSAGES
// ========================================
function filtrerMessagesAdmin() {
    console.log("🔍 [ADMIN] Filtrage messages");
    
    const typeFilter = document.getElementById('filterMessageType').value;
    const searchTerm = document.getElementById('searchMessageAdmin').value.toLowerCase();
    
    let messagesFiltres = [...messagesListe];
    
    // Filtrer par type
    if (typeFilter !== 'all') {
        messagesFiltres = messagesFiltres.filter(msg => msg.type === typeFilter);
    }
    
    // Filtrer par texte de recherche
    if (searchTerm) {
        messagesFiltres = messagesFiltres.filter(msg => 
            msg.message.toLowerCase().includes(searchTerm) ||
            msg.auteur.toLowerCase().includes(searchTerm) ||
            msg.destinataire.toLowerCase().includes(searchTerm)
        );
    }
    
    afficherMessagesAdmin(messagesFiltres);
}

// ========================================
// 🗑️ SUPPRESSION MESSAGE ADMIN
// ========================================
async function supprimerMessageAdmin(messageId, auteurNom) {
    console.log("🗑️ [ADMIN] Suppression message:", messageId, auteurNom);
    
    // Confirmation de sécurité
    const confirmation = confirm(`⚠️ SUPPRESSION MESSAGE\n\nÊtes-vous sûr de vouloir supprimer ce message de "${auteurNom}" ?\n\nCette action est IRRÉVERSIBLE !`);
    
    if (!confirmation) {
        console.log("🚫 [ADMIN] Suppression message annulée par l'utilisateur");
        return;
    }
    
    try {
        console.log("🔄 [ADMIN] Envoi demande suppression message...");
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(API_CONFIG.url(`/messages/admin/supprimer-message/${messageId}?userId=${user._id}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log("✅ [ADMIN] Message supprimé avec succès");
            alert(`✅ Message de "${auteurNom}" supprimé avec succès`);
            
            // Recharger la liste des messages
            await chargerMessagesAdmin();
            
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur suppression message:", error);
        alert(`❌ Erreur lors de la suppression: ${error.message}`);
    }
}

// ========================================
// 🗑️ SUPPRESSION UTILISATEUR
// ========================================
async function supprimerUtilisateurAdmin(userId, userName) {
    console.log("🗑️ [ADMIN] === DÉBUT SUPPRESSION UTILISATEUR ===");
    console.log("🗑️ [ADMIN] ID utilisateur cible:", userId);
    console.log("🗑️ [ADMIN] Nom utilisateur cible:", userName);
    console.log("🗑️ [ADMIN] Timestamp:", new Date().toISOString());
    
    // Vérifier que l'admin ne se supprime pas lui-même
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("🔍 [ADMIN] Utilisateur admin actuel:", currentUser._id);
    
    if (currentUser._id === userId) {
        console.error("❌ [ADMIN] ERREUR - Tentative d'auto-suppression détectée !");
        alert("❌ Erreur : Vous ne pouvez pas vous supprimer vous-même !");
        return;
    }
    
    // Confirmation de sécurité
    console.log("⚠️ [ADMIN] Demande de confirmation à l'utilisateur...");
    const confirmation = confirm(`⚠️ ATTENTION !\n\nÊtes-vous sûr de vouloir supprimer définitivement l'utilisateur :\n\n"${userName}"\n\nCette action est IRRÉVERSIBLE !\n\nTapez "SUPPRIMER" pour confirmer.`);
    
    if (!confirmation) {
        console.log("🚫 [ADMIN] Suppression annulée par l'utilisateur (première confirmation)");
        return;
    }
    
    console.log("⚠️ [ADMIN] Première confirmation OK, demande double confirmation...");
    const doubleConfirmation = prompt(`Pour confirmer la suppression de "${userName}", tapez exactement : SUPPRIMER`);
    
    if (doubleConfirmation !== 'SUPPRIMER') {
        alert('❌ Suppression annulée - confirmation incorrecte');
        console.log("🚫 [ADMIN] Suppression annulée - confirmation incorrecte:", doubleConfirmation);
        return;
    }
    
    console.log("✅ [ADMIN] Double confirmation OK, envoi de la requête...");
    
    try {
        console.log("🔄 [ADMIN] Envoi demande suppression utilisateur...");
        console.log("🔄 [ADMIN] URL de la requête:", API_CONFIG.url(`/friends/supprimer/${userId}`));
        
        const response = await fetch(API_CONFIG.url(`/friends/supprimer/${userId}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log("📡 [ADMIN] Réponse serveur reçue:", response.status, response.statusText);
        
        if (response.ok) {
            console.log("✅ [ADMIN] Utilisateur supprimé avec succès");
            alert(`✅ Utilisateur "${userName}" supprimé avec succès`);
            
            // Recharger la liste des utilisateurs
            await chargerUtilisateursAdmin();
            await chargerStatistiquesAdmin();
            
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur suppression utilisateur:", error);
        alert(`❌ Erreur lors de la suppression: ${error.message}`);
    }
}

// ========================================
// 🧹 NETTOYAGE ANCIENS MESSAGES
// ========================================
function nettoyerAncienMessages() {
    console.log("🧹 [ADMIN] Nettoyage anciens messages");
    
    const confirmation = confirm("⚠️ Êtes-vous sûr de vouloir nettoyer les anciens messages ?\n\nCette action supprimera tous les messages de plus de 30 jours.\n\nCette action est IRRÉVERSIBLE !");
    
    if (confirmation) {
        alert("🚧 Fonctionnalité en cours de développement");
        console.log("🚧 [ADMIN] Fonctionnalité nettoyage en cours de développement");
    }
}

// ========================================
// 📁 EXPORT DONNÉES
// ========================================
function exporterDonnees() {
    console.log("📁 [ADMIN] Export données");
    
    try {
        const donneesExport = {
            statistiques: statistiquesAdmin,
            utilisateurs: utilisateursListe.map(u => ({
                nom: u.nom,
                prenom: u.prenom,
                email: u.email,
                pseudonyme: u.pseudonyme,
                region: u.region,
                role: u.role
            })),
            dateExport: new Date().toISOString()
        };
        
        const jsonString = JSON.stringify(donneesExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cheznous-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log("✅ [ADMIN] Export réussi");
        alert("✅ Données exportées avec succès");
        
    } catch (error) {
        console.error("❌ [ADMIN] Erreur export:", error);
        alert("❌ Erreur lors de l'export");
    }
}

// ========================================
// 🌍 EXPOSITION GLOBALE DU MODULE
// ========================================
window.AdminModule = {
    initialiser: initialiserAdmin,
    chargerDonnees: chargerDonneesAdmin,
    supprimerUtilisateur: supprimerUtilisateurAdmin,
    supprimerMessageAdmin: supprimerMessageAdmin
};

// Exposer les fonctions individuelles pour les boutons HTML
window.supprimerUtilisateurAdmin = supprimerUtilisateurAdmin;
window.supprimerMessageAdmin = supprimerMessageAdmin;
window.nettoyerAncienMessages = nettoyerAncienMessages;
window.exporterDonnees = exporterDonnees;

console.log("✅ [ADMIN] === MODULE ADMINISTRATION DÉFINI ===");
console.log("🌍 [TERMINAL] Module admin disponible globalement");
