// ========================================
// 📋 MODULE HISTORIQUE OPTIMISÉ
// Gestion de l'historique des messages personnels et d'amis
// ========================================

console.log("🚀 [HISTORIQUE] === MODULE HISTORIQUE CHARGÉ ===");
console.log("📋 [TERMINAL] Initialisation système gestion historique");

// ========================================
// 💾 VARIABLES GLOBALES HISTORIQUE
// ========================================
let historiquePersonnel = JSON.parse(localStorage.getItem('historiquePersonnel') || '[]');
let historiqueAmis = JSON.parse(localStorage.getItem('historiqueAmis') || '[]');

console.log("📋 [HISTORIQUE] Initialisation gestion historique");
console.log(`💾 [HISTORIQUE] Messages personnels en historique: ${historiquePersonnel.length}`);
console.log(`👥 [HISTORIQUE] Messages d'amis en historique: ${historiqueAmis.length}`);

// ========================================
// 💾 SAUVEGARDE MESSAGE PERSONNEL DANS HISTORIQUE
// ========================================
function sauvegarderDansHistoriquePersonnel(message) {
    console.log("💾 [HISTORIQUE] Sauvegarde message personnel dans historique");
    console.log(`📝 [TERMINAL] Message à sauvegarder: "${message.substring(0, 30)}..."`);
    
    const entree = {
        message: message,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Ajouter au début de la liste (plus récent en premier)
    historiquePersonnel.unshift(entree);
    
    // Garder seulement les 50 derniers messages
    if (historiquePersonnel.length > 50) {
        historiquePersonnel = historiquePersonnel.slice(0, 50);
        console.log("🗂️ [HISTORIQUE] Historique personnel tronqué à 50 messages maximum");
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('historiquePersonnel', JSON.stringify(historiquePersonnel));
    
    console.log(`✅ [HISTORIQUE] Message personnel sauvegardé. Total: ${historiquePersonnel.length}`);
    console.log(`💾 [TERMINAL] Historique personnel mis à jour avec succès`);
    
    mettreAJourCompteurPersonnel();
}

// ========================================
// 👥 SAUVEGARDE MESSAGES AMIS DANS HISTORIQUE
// ========================================
function sauvegarderDansHistoriqueAmis(messages) {
    console.log("👥 [HISTORIQUE] Sauvegarde messages d'amis dans historique");
    console.log(`📝 [TERMINAL] Nombre de messages à traiter: ${messages.length}`);
    
    let nouveauxMessages = 0;
    
    messages.forEach(function(msg) {
        // Vérifier si le message n'existe pas déjà dans l'historique
        const existe = historiqueAmis.some(function(h) {
            return h.message === msg.message && 
                   h.auteurId === msg.auteurId && 
                   h.date === msg.date;
        });
        
        if (!existe) {
            const entree = {
                message: msg.message,
                auteurPrenom: msg.auteurPrenom,
                auteurNom: msg.auteurNom,
                auteurId: msg.auteurId,
                auteurPseudonyme: msg.auteurPseudonyme || '',
                date: msg.date,
                timestamp: Date.now()
            };
            
            historiqueAmis.unshift(entree);
            nouveauxMessages++;
            console.log(`➕ [TERMINAL] Nouveau message ajouté: ${msg.auteurPrenom} ${msg.auteurNom}`);
        }
    });
    
    // Garder seulement les 100 derniers messages d'amis
    if (historiqueAmis.length > 100) {
        historiqueAmis = historiqueAmis.slice(0, 100);
        console.log("🗂️ [HISTORIQUE] Historique amis tronqué à 100 messages maximum");
    }
    
    localStorage.setItem('historiqueAmis', JSON.stringify(historiqueAmis));
    
    console.log(`✅ [HISTORIQUE] Messages d'amis sauvegardés. Nouveaux: ${nouveauxMessages}, Total: ${historiqueAmis.length}`);
    console.log(`👥 [TERMINAL] Historique amis mis à jour avec succès`);
    
    mettreAJourCompteurAmis();
}

// ========================================
// 📋 AFFICHAGE HISTORIQUE MESSAGES PERSONNELS
// ========================================
function afficherHistoriquePersonnel() {
    console.log("📋 [HISTORIQUE] Affichage historique messages personnels");
    console.log(`📊 [TERMINAL] ${historiquePersonnel.length} messages à afficher`);
    
    const container = document.getElementById('historiquePersonnelListe');
    
    if (!container) {
        console.error("❌ [HISTORIQUE] Container historique personnel introuvable");
        return;
    }
    
    if (historiquePersonnel.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun message dans l\'historique</p>';
        console.log("📭 [TERMINAL] Aucun message personnel dans historique");
        return;
    }
    
    const contenuHTML = historiquePersonnel.map(function(entree, index) {
        const dateFormatee = new Date(entree.date).toLocaleString('fr-FR');
        return `
            <div style="border: 1px solid #28a745; padding: 8px; margin: 5px 0; border-radius: 5px; background-color: white;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: #28a745;">Message #${index + 1}</strong>
                    <small style="color: #6c757d;">${dateFormatee}</small>
                </div>
                <div>${entree.message}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = contenuHTML;
    console.log(`✅ [TERMINAL] Historique personnel affiché: ${historiquePersonnel.length} messages`);
}

// ========================================
// 👥 AFFICHAGE HISTORIQUE MESSAGES AMIS
// ========================================
function afficherHistoriqueAmis() {
    console.log("👥 [HISTORIQUE] Affichage historique messages d'amis");
    console.log(`📊 [TERMINAL] ${historiqueAmis.length} messages à afficher`);
    
    const container = document.getElementById('historiqueAmisListe');
    
    if (!container) {
        console.error("❌ [HISTORIQUE] Container historique amis introuvable");
        return;
    }
    
    if (historiqueAmis.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun message d\'ami dans l\'historique</p>';
        console.log("📭 [TERMINAL] Aucun message d'ami dans historique");
        return;
    }
    
    const contenuHTML = historiqueAmis.map(function(entree, index) {
        const dateFormatee = new Date(entree.date).toLocaleString('fr-FR');
        return `
            <div style="border: 1px solid #fd7e14; padding: 8px; margin: 5px 0; border-radius: 5px; background-color: white;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: #fd7e14;">De: ${entree.auteurPrenom} ${entree.auteurNom}</strong>
                    <small style="color: #6c757d;">${dateFormatee}</small>
                </div>
                <div>${entree.message}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = contenuHTML;
    console.log(`✅ [TERMINAL] Historique amis affiché: ${historiqueAmis.length} messages`);
}

// ========================================
// 🔢 MISE À JOUR COMPTEURS
// ========================================
function mettreAJourCompteurPersonnel() {
    const compteur = document.getElementById('compteurPersonnel');
    if (compteur) {
        compteur.textContent = `${historiquePersonnel.length} messages sauvegardés`;
        console.log(`🔢 [HISTORIQUE] Compteur personnel mis à jour: ${historiquePersonnel.length}`);
    }
}

function mettreAJourCompteurAmis() {
    const compteur = document.getElementById('compteurAmis');
    if (compteur) {
        compteur.textContent = `${historiqueAmis.length} messages sauvegardés`;
        console.log(`🔢 [HISTORIQUE] Compteur amis mis à jour: ${historiqueAmis.length}`);
    }
}

// ========================================
// 👁️ TOGGLE AFFICHAGE HISTORIQUE PERSONNEL
// ========================================
function toggleHistoriquePersonnel() {
    console.log("👁️ [HISTORIQUE] Toggle historique personnel demandé");
    
    const container = document.getElementById('historiquePersonnelContainer');
    const bouton = document.getElementById('toggleHistoriquePersonnel');
    
    if (!container || !bouton) {
        console.error("❌ [HISTORIQUE] Éléments historique personnel introuvables");
        return;
    }
    
    const estMasque = container.style.display === 'none';
    
    if (estMasque) {
        console.log("👁️ [HISTORIQUE] Affichage historique personnel");
        console.log("📊 [TERMINAL] Ouverture panneau historique personnel");
        
        container.style.display = 'block';
        bouton.textContent = '🙈 Masquer historique';
        afficherHistoriquePersonnel();
        mettreAJourCompteurPersonnel();
        
        console.log("✅ [HISTORIQUE] Historique personnel affiché");
    } else {
        console.log("🙈 [HISTORIQUE] Masquage historique personnel");
        console.log("📊 [TERMINAL] Fermeture panneau historique personnel");
        
        container.style.display = 'none';
        bouton.textContent = '📋 Voir historique';
        
        console.log("✅ [HISTORIQUE] Historique personnel masqué");
    }
}

// ========================================
// 👥 TOGGLE AFFICHAGE HISTORIQUE AMIS
// ========================================
function toggleHistoriqueAmis() {
    console.log("👥 [HISTORIQUE] Toggle historique amis demandé");
    
    const container = document.getElementById('historiqueAmisContainer');
    const bouton = document.getElementById('toggleHistoriqueAmis');
    
    if (!container || !bouton) {
        console.error("❌ [HISTORIQUE] Éléments historique amis introuvables");
        return;
    }
    
    const estMasque = container.style.display === 'none';
    
    if (estMasque) {
        console.log("👁️ [HISTORIQUE] Affichage historique amis");
        console.log("📊 [TERMINAL] Ouverture panneau historique amis");
        
        container.style.display = 'block';
        bouton.textContent = '🙈 Masquer historique';
        afficherHistoriqueAmis();
        mettreAJourCompteurAmis();
        
        console.log("✅ [HISTORIQUE] Historique amis affiché");
    } else {
        console.log("🙈 [HISTORIQUE] Masquage historique amis");
        console.log("📊 [TERMINAL] Fermeture panneau historique amis");
        
        container.style.display = 'none';
        bouton.textContent = '📋 Voir historique';
        
        console.log("✅ [HISTORIQUE] Historique amis masqué");
    }
}

// ========================================
// 🗑️ VIDAGE HISTORIQUE PERSONNEL
// ========================================
function viderHistoriquePersonnel() {
    console.log("🗑️ [HISTORIQUE] Demande vidage historique personnel");
    
    if (confirm('Êtes-vous sûr de vouloir vider l\'historique de vos messages personnels ?')) {
        console.log("🗑️ [HISTORIQUE] Confirmation vidage - Suppression historique personnel");
        console.log(`📊 [TERMINAL] Suppression de ${historiquePersonnel.length} messages personnels`);
        
        historiquePersonnel = [];
        localStorage.removeItem('historiquePersonnel');
        
        afficherHistoriquePersonnel();
        mettreAJourCompteurPersonnel();
        
        alert('Historique des messages personnels vidé !');
        console.log("✅ [HISTORIQUE] Historique personnel vidé avec succès");
        console.log("💾 [TERMINAL] localStorage.historiquePersonnel supprimé");
    } else {
        console.log("❌ [HISTORIQUE] Vidage historique personnel annulé par utilisateur");
    }
}

// ========================================
// 🗑️ VIDAGE HISTORIQUE AMIS
// ========================================
function viderHistoriqueAmis() {
    console.log("🗑️ [HISTORIQUE] Demande vidage historique amis");
    
    if (confirm('Êtes-vous sûr de vouloir vider l\'historique des messages d\'amis ?')) {
        console.log("🗑️ [HISTORIQUE] Confirmation vidage - Suppression historique amis");
        console.log(`📊 [TERMINAL] Suppression de ${historiqueAmis.length} messages d'amis`);
        
        historiqueAmis = [];
        localStorage.removeItem('historiqueAmis');
        
        afficherHistoriqueAmis();
        mettreAJourCompteurAmis();
        
        alert('Historique des messages d\'amis vidé !');
        console.log("✅ [HISTORIQUE] Historique amis vidé avec succès");
        console.log("💾 [TERMINAL] localStorage.historiqueAmis supprimé");
    } else {
        console.log("❌ [HISTORIQUE] Vidage historique amis annulé par utilisateur");
    }
}

// ========================================
// 🚀 INITIALISATION MODULE HISTORIQUE
// ========================================
function initialiserHistorique() {
    console.log("🚀 [HISTORIQUE] === DÉBUT INITIALISATION HISTORIQUE ===");
    console.log("📋 [TERMINAL] Configuration système gestion historique");
    
    try {
        // Configurer boutons toggle historique
        const boutonTogglePersonnel = document.getElementById('toggleHistoriquePersonnel');
        if (boutonTogglePersonnel) {
            boutonTogglePersonnel.addEventListener('click', toggleHistoriquePersonnel);
            console.log("✅ [HISTORIQUE] Bouton toggle historique personnel configuré");
        }
        
        const boutonToggleAmis = document.getElementById('toggleHistoriqueAmis');
        if (boutonToggleAmis) {
            boutonToggleAmis.addEventListener('click', toggleHistoriqueAmis);
            console.log("✅ [HISTORIQUE] Bouton toggle historique amis configuré");
        }
        
        // Configurer boutons vidage
        const boutonViderPersonnel = document.getElementById('viderHistoriquePersonnel');
        if (boutonViderPersonnel) {
            boutonViderPersonnel.addEventListener('click', viderHistoriquePersonnel);
            console.log("✅ [HISTORIQUE] Bouton vidage historique personnel configuré");
        }
        
        const boutonViderAmis = document.getElementById('viderHistoriqueAmis');
        if (boutonViderAmis) {
            boutonViderAmis.addEventListener('click', viderHistoriqueAmis);
            console.log("✅ [HISTORIQUE] Bouton vidage historique amis configuré");
        }
        
        // Initialiser les compteurs
        mettreAJourCompteurPersonnel();
        mettreAJourCompteurAmis();
        
        console.log("✅ [HISTORIQUE] === HISTORIQUE INITIALISÉ AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Système historique opérationnel");
        console.log(`📊 [TERMINAL] Historique personnel: ${historiquePersonnel.length} messages`);
        console.log(`📊 [TERMINAL] Historique amis: ${historiqueAmis.length} messages`);
        
    } catch (error) {
        console.error("💥 [HISTORIQUE] ERREUR lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation historique:", error.stack);
    }
}

// ========================================
// 📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [HISTORIQUE] DOM chargé - Lancement historique");
    
    setTimeout(() => {
        initialiserHistorique();
    }, 400);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.HistoriqueModule = {
    initialiser: initialiserHistorique,
    sauvegarderPersonnel: sauvegarderDansHistoriquePersonnel,
    sauvegarderAmis: sauvegarderDansHistoriqueAmis,
    afficherPersonnel: afficherHistoriquePersonnel,
    afficherAmis: afficherHistoriqueAmis,
    togglePersonnel: toggleHistoriquePersonnel,
    toggleAmis: toggleHistoriqueAmis,
    viderPersonnel: viderHistoriquePersonnel,
    viderAmis: viderHistoriqueAmis,
    mettreAJourCompteurs: function() {
        mettreAJourCompteurPersonnel();
        mettreAJourCompteurAmis();
    }
};

console.log("✅ [HISTORIQUE] === MODULE HISTORIQUE DÉFINI ===");
console.log("🌍 [TERMINAL] Module historique disponible globalement");
