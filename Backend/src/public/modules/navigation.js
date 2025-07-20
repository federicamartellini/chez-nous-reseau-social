// ========================================
// 🧭 MODULE NAVIGATION OPTIMISÉ
// Gestion du menu burger et navigation
// ========================================

console.log("🚀 [NAVIGATION] Module navigation chargé");

// ========================================
// 📋 GESTIONNAIRE DU MENU BURGER
// ========================================
function initialiserMenuBurger() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) {
        console.warn("⚠️ [NAVIGATION] Éléments navigation introuvables");
        return;
    }
    
    // Clic sur le bouton burger
    navToggle.addEventListener('click', function() {
        const isActive = navToggle.classList.contains('active');
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        console.log(`🔄 [NAVIGATION] Menu ${isActive ? 'fermé' : 'ouvert'}`);
    });
    
    // Fermer le menu quand on clique sur un lien
    navMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            const clickedId = e.target.id;
            
            // Délai pour les boutons de modal
            if (clickedId === 'loginBtn' || clickedId === 'registerBtn') {
                setTimeout(() => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }, 150);
            } else {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
    
    // Fermer le menu quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            if (navToggle.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
}

// ========================================
// 👤 GESTION DE L'AFFICHAGE UTILISATEUR
// ========================================
function mettreAJourAffichageUtilisateur() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        accountBtn: document.getElementById('accountBtn'),
        userName: document.getElementById('userName')
    };
    
    if (user._id) {
        // Utilisateur connecté
        if (elements.loginBtn) elements.loginBtn.style.display = 'none';
        if (elements.registerBtn) elements.registerBtn.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'block';
        if (elements.accountBtn) elements.accountBtn.style.display = 'flex';
        if (elements.userName) elements.userName.textContent = `${user.prenom || ''} ${user.nom || ''}`.trim();
        
        console.log(`✅ [NAVIGATION] Interface connectée - ${user.prenom || 'Utilisateur'}`);
    } else {
        // Utilisateur non connecté
        if (elements.loginBtn) elements.loginBtn.style.display = 'block';
        if (elements.registerBtn) elements.registerBtn.style.display = 'block';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
        if (elements.accountBtn) elements.accountBtn.style.display = 'none';
        
        console.log("ℹ️ [NAVIGATION] Interface visiteur");
    }
}

// ========================================
// 🚪 GESTION DE LA DÉCONNEXION
// ========================================
function gererDeconnexion() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.warn("⚠️ [NAVIGATION] Bouton déconnexion introuvable");
        return;
    }
    
    // Éviter les écouteurs multiples
    if (logoutBtn.dataset.listenerAdded) return;
    logoutBtn.dataset.listenerAdded = 'true';
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Utiliser la méthode AuthManager.handleLogout pour une déconnexion complète
        if (window.AuthManager && typeof window.AuthManager.handleLogout === 'function') {
            console.log("🔄 [NAVIGATION] Déconnexion via AuthManager");
            window.AuthManager.handleLogout();
        } else {
            // Fallback si AuthManager n'est pas disponible
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                const user = JSON.parse(localStorage.getItem('user'));
                
                // LOG VISIBLE DÉCONNEXION CÔTÉ CLIENT
                if (user) {
                    console.log('');
                    console.log('🔴 ================================');
                    console.log('🔴 DÉCONNEXION (NAVIGATION)');
                    console.log('🔴 ================================');
                    console.log(`🔴 Utilisateur: ${user.nom} ${user.prenom}`);
                    console.log(`🔴 Email: ${user.email}`);
                    console.log(`🔴 Pseudonyme: ${user.pseudonyme || 'Non défini'}`);
                    console.log(`🔴 Heure: ${new Date().toLocaleString('fr-FR')}`);
                    console.log('🔴 ================================');
                    console.log('');
                }
                
                // Envoyer un événement de déconnexion explicite au serveur
                if (window.socket && window.socket.connected) {
                    window.socket.emit('manual disconnect', { user: user });
                    console.log('📤 [SOCKET] Événement de déconnexion envoyé au serveur');
                    
                    // Attendre un peu pour que le serveur traite l'événement
                    setTimeout(() => {
                        localStorage.removeItem('user');
                        location.reload();
                    }, 200);
                } else {
                    localStorage.removeItem('user');
                    location.reload();
                }
            }
        }
    });
}

// ========================================
// 🔄 SURVEILLANCE DES CHANGEMENTS D'ÉTAT
// ========================================
function surveillerChangementsUtilisateur() {
    // Créer un observateur pour localStorage plus performant
    let dernierUtilisateur = localStorage.getItem('user');
    
    // Écouter les événements de storage (changements dans localStorage)
    window.addEventListener('storage', function(e) {
        if (e.key === 'user') {
            console.log("🔄 [NAVIGATION] Changement utilisateur détecté");
            mettreAJourAffichageUtilisateur();
        }
    });
    
    // Backup avec vérification périodique légère (toutes les 3 secondes)
    setInterval(() => {
        const utilisateurActuel = localStorage.getItem('user');
        if (utilisateurActuel !== dernierUtilisateur) {
            mettreAJourAffichageUtilisateur();
            dernierUtilisateur = utilisateurActuel;
        }
    }, 3000);
}

// ========================================
// 🚀 INITIALISATION DU MODULE
// ========================================
function initialiserNavigation() {
    try {
        initialiserMenuBurger();
        gererDeconnexion();
        mettreAJourAffichageUtilisateur();
        surveillerChangementsUtilisateur();
        
        console.log("✅ [NAVIGATION] Module initialisé");
    } catch (error) {
        console.error("💥 [NAVIGATION] Erreur d'initialisation:", error.message);
    }
}

// ========================================
// 📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Petite temporisation pour s'assurer que tous les éléments sont présents
    setTimeout(() => {
        initialiserNavigation();
    }, 100);
});

// Exporter les fonctions pour usage externe
window.NavigationModule = {
    initialiser: initialiserNavigation,
    mettreAJourUtilisateur: mettreAJourAffichageUtilisateur
};

console.log("✅ [NAVIGATION] Module navigation défini");
