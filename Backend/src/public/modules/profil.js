// ========================================
// 👤 MODULE PROFIL OPTIMISÉ
// Gestion du profil utilisateur et des détails
// ========================================

console.log("🚀 [PROFIL] === MODULE PROFIL CHARGÉ ===");
console.log("👤 [TERMINAL] Initialisation du système de gestion profil");

// ========================================
// 📊 VARIABLES GLOBALES DU PROFIL
// ========================================
let profilActuelAffiché = false;

// ========================================
// 👁️ GESTION AFFICHAGE/MASQUAGE DÉTAILS PROFIL
// ========================================
function toggleProfilDetails() {
    console.log("🔄 [PROFIL] Toggle détails profil demandé");
    console.log("👁️ [TERMINAL] Basculement affichage détails utilisateur");
    
    const detailsSection = document.getElementById('profil-details');
    const bouton = document.getElementById('voirProfilBtn');
    
    if (!detailsSection || !bouton) {
        console.error("❌ [PROFIL] Éléments profil introuvables");
        console.error("🚫 [TERMINAL] Impossible d'afficher les détails profil");
        return;
    }
    
    const estMasque = detailsSection.style.display === 'none';
    
    if (estMasque) {
        console.log("👁️ [PROFIL] Affichage des détails profil");
        console.log("📊 [TERMINAL] Ouverture section détails utilisateur");
        
        // Afficher les détails
        detailsSection.style.display = 'block';
        detailsSection.setAttribute('aria-hidden', 'false');
        bouton.setAttribute('aria-expanded', 'true');
        bouton.textContent = 'Masquer le profil';
        bouton.setAttribute('aria-label', 'Masquer les détails du profil utilisateur');
        
        profilActuelAffiché = true;
        console.log("✅ [PROFIL] Détails profil affichés avec succès");
        
    } else {
        console.log("🙈 [PROFIL] Masquage des détails profil");
        console.log("📊 [TERMINAL] Fermeture section détails utilisateur");
        
        // Masquer les détails
        detailsSection.style.display = 'none';
        detailsSection.setAttribute('aria-hidden', 'true');
        bouton.setAttribute('aria-expanded', 'false');
        bouton.textContent = 'Voir le profil';
        bouton.setAttribute('aria-label', 'Voir les détails du profil utilisateur');
        
        profilActuelAffiché = false;
        console.log("✅ [PROFIL] Détails profil masqués avec succès");
    }
}

// ========================================
// 📝 CHARGEMENT DES DONNÉES PROFIL
// ========================================
function chargerDonneesProfil() {
    console.log("📥 [PROFIL] === DÉBUT CHARGEMENT DONNÉES PROFIL ===");
    console.log("💾 [TERMINAL] Récupération informations utilisateur connecté");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user._id) {
            console.warn("⚠️ [PROFIL] Aucun utilisateur connecté");
            console.warn("🔐 [TERMINAL] Impossible de charger profil - session inexistante");
            return false;
        }
        
        console.log("👤 [PROFIL] Utilisateur trouvé:");
        console.log(`   📛 Nom: ${user.nom || 'Non défini'}`);
        console.log(`   👋 Prénom: ${user.prenom || 'Non défini'}`);
        console.log(`   🎭 Pseudo: ${user.pseudonyme || 'Non défini'}`);
        console.log(`   📍 Région: ${user.region || 'Non définie'}`);
        console.log(`   📧 Email: ${user.email || 'Non défini'}`);
        console.log(`   🎗️ Rôle: ${user.role || 'Membre'}`);
        console.log(`   🆔 ID: ${user._id}`);
        
        // Mise à jour des éléments du profil
        const elements = {
            profilNom: user.nom || 'Non défini',
            profilPrenom: user.prenom || 'Non défini', 
            profilPseudo: user.pseudonyme || 'Non défini',
            profilRegion: user.region || 'Non définie',
            profilEmail: masquerEmail(user.email) || 'Non défini',
            profilRole: user.role || 'Membre'
        };
        
        console.log("🎨 [PROFIL] Mise à jour des éléments HTML:");
        for (const [elementId, valeur] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = valeur;
                console.log(`   ✅ ${elementId}: "${valeur}"`);
            } else {
                console.warn(`   ⚠️ Élément ${elementId} introuvable`);
            }
        }
        
        console.log("✅ [PROFIL] === DONNÉES PROFIL CHARGÉES AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Profil utilisateur mis à jour dans l'interface");
        return true;
        
    } catch (error) {
        console.error("💥 [PROFIL] ERREUR lors du chargement profil:", error.message);
        console.error("🚨 [TERMINAL] Échec chargement profil:", error.stack);
        return false;
    }
}

// ========================================
// 🔒 UTILITAIRE MASQUAGE EMAIL (RGPD)
// ========================================
function masquerEmail(email) {
    if (!email || !email.includes('@')) {
        return email;
    }
    
    const [nom, domaine] = email.split('@');
    const nomMasque = nom.length > 2 ? 
        nom.substring(0, 2) + '*'.repeat(nom.length - 2) : 
        nom + '*';
    
    const emailMasque = nomMasque + '@' + domaine;
    
    console.log(`🔒 [PROFIL] Email masqué pour RGPD: ${email} → ${emailMasque}`);
    
    return emailMasque;
}

// ========================================
// 🎨 AFFICHAGE/MASQUAGE SECTION PROFIL
// ========================================
function afficherSectionProfil() {
    console.log("🎨 [PROFIL] Affichage section profil demandé");
    console.log("📱 [TERMINAL] Activation interface profil utilisateur");
    
    const profilSection = document.getElementById('profilSection');
    
    if (!profilSection) {
        console.error("❌ [PROFIL] Section profil introuvable");
        console.error("🚫 [TERMINAL] Impossible d'afficher section profil");
        return false;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user._id) {
        console.warn("⚠️ [PROFIL] Utilisateur non connecté - masquage section profil");
        console.warn("🔐 [TERMINAL] Section profil non disponible pour visiteur");
        profilSection.style.display = 'none';
        return false;
    }
    
    // Charger les données et afficher la section
    if (chargerDonneesProfil()) {
        profilSection.style.display = 'block';
        console.log("✅ [PROFIL] Section profil affichée avec succès");
        console.log("🎉 [TERMINAL] Interface profil opérationnelle");
        return true;
    }
    
    return false;
}

function masquerSectionProfil() {
    console.log("🙈 [PROFIL] Masquage section profil");
    console.log("📱 [TERMINAL] Désactivation interface profil");
    
    const profilSection = document.getElementById('profilSection');
    
    if (profilSection) {
        profilSection.style.display = 'none';
        console.log("✅ [PROFIL] Section profil masquée");
    }
}

// ========================================
// 🔄 ACTUALISATION PROFIL
// ========================================
function actualiserProfil() {
    console.log("🔄 [PROFIL] Actualisation profil demandée");
    console.log("♻️ [TERMINAL] Rechargement données profil utilisateur");
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user._id) {
        console.log("👤 [PROFIL] Utilisateur connecté - actualisation profil");
        afficherSectionProfil();
    } else {
        console.log("👤 [PROFIL] Aucun utilisateur - masquage profil");
        masquerSectionProfil();
    }
}

// ========================================
// 🚀 INITIALISATION DU MODULE PROFIL
// ========================================
function initialiserProfil() {
    console.log("🚀 [PROFIL] === DÉBUT INITIALISATION PROFIL ===");
    console.log("👤 [TERMINAL] Configuration système gestion profil");
    
    try {
        // Configurer le bouton de toggle des détails
        const boutonProfil = document.getElementById('voirProfilBtn');
        if (boutonProfil) {
            boutonProfil.addEventListener('click', toggleProfilDetails);
            console.log("✅ [PROFIL] Bouton toggle profil configuré");
        } else {
            console.warn("⚠️ [PROFIL] Bouton toggle profil introuvable");
        }
        
        // Vérifier et afficher le profil si utilisateur connecté
        actualiserProfil();
        
        console.log("✅ [PROFIL] === PROFIL INITIALISÉ AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Système profil opérationnel");
        
    } catch (error) {
        console.error("💥 [PROFIL] ERREUR lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation profil:", error.stack);
    }
}

// ========================================
// 📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [PROFIL] DOM chargé - Lancement profil");
    console.log("⏱️ [TERMINAL] Temporisation pour assurer le chargement");
    
    setTimeout(() => {
        initialiserProfil();
    }, 200);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.ProfilModule = {
    initialiser: initialiserProfil,
    actualiser: actualiserProfil,
    afficher: afficherSectionProfil,
    masquer: masquerSectionProfil,
    toggleDetails: toggleProfilDetails,
    chargerDonnees: chargerDonneesProfil
};

console.log("✅ [PROFIL] === MODULE PROFIL DÉFINI ===");
console.log("🌍 [TERMINAL] Module profil disponible globalement");
