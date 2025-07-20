// ========================================
// 🚀 MODULE D'INITIALISATION PRINCIPAL
// Coordination et orchestration de tous les modules
// ========================================

console.log("🚀 [APP-INIT] === MODULE D'INITIALISATION PRINCIPAL CHARGÉ ===");
console.log("⚡ [TERMINAL] Démarrage orchestration complète de l'application");
console.log("📱 [TERMINAL] Chez Nous - Réseau Social des Voisins v2.0 OPTIMISÉ");

// ========================================
// 📊 VARIABLES GLOBALES D'ÉTAT
// ========================================
let applicationInitialisee = false;
let modulesCharges = {
    navigation: false,
    profil: false,
    messages: false,
    historique: false,
    amis: false,
    chat: false
};

// ========================================
// 🔍 VÉRIFICATION ÉTAT UTILISATEUR
// ========================================
function verifierEtatUtilisateur() {
    console.log("🔍 [APP-INIT] === VÉRIFICATION ÉTAT UTILISATEUR ===");
    console.log("👤 [TERMINAL] Analyse session utilisateur actuelle");
    
    const userStored = localStorage.getItem('user');
    const currentUserIdStored = localStorage.getItem('currentUserId');
    
    console.log("📊 [APP-INIT] État localStorage:");
    console.log(`   ├── user: ${userStored ? 'PRÉSENT' : 'ABSENT'}`);
    console.log(`   └── currentUserId: ${currentUserIdStored || 'ABSENT'}`);
    
    if (userStored) {
        try {
            const user = JSON.parse(userStored);
            console.log("✅ [APP-INIT] Utilisateur connecté détecté:");
            console.log(`   ├── Nom: ${user.nom || 'Non défini'}`);
            console.log(`   ├── Prénom: ${user.prenom || 'Non défini'}`);
            console.log(`   ├── Pseudo: ${user.pseudonyme || 'Non défini'}`);
            console.log(`   ├── ID: ${user._id || 'Non défini'}`);
            console.log(`   └── Email: ${user.email ? user.email.substring(0, 3) + '***' : 'Non défini'}`);
            
            // Synchroniser currentUserId si nécessaire
            if (!currentUserIdStored && user._id) {
                localStorage.setItem('currentUserId', user._id);
                console.log("🔄 [APP-INIT] currentUserId synchronisé automatiquement");
            }
            
            // Activer les sections pour utilisateur connecté
            activerSectionsUtilisateur();
            
            return user;
            
        } catch (error) {
            console.error("💥 [APP-INIT] Erreur parsing user localStorage:", error.message);
            console.error("🧹 [TERMINAL] Nettoyage localStorage corrompu");
            localStorage.removeItem('user');
            localStorage.removeItem('currentUserId');
        }
    }
    
    console.log("⚠️ [APP-INIT] Aucun utilisateur connecté - mode visiteur");
    console.log("🔐 [TERMINAL] Interface limitée aux fonctionnalités publiques");
    
    // Désactiver les sections pour visiteur
    desactiverSectionsUtilisateur();
    
    return null;
}

// ========================================
// 🎨 GESTION AFFICHAGE SECTIONS UTILISATEUR
// ========================================
function activerSectionsUtilisateur() {
    console.log("🎨 [APP-INIT] Activation sections utilisateur connecté");
    console.log("👤 [TERMINAL] Affichage interface complète");
    
    const sectionsUtilisateur = [
        'profilSection',
        'amisConfirmesSection',
        'chatSection'
    ];
    
    sectionsUtilisateur.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            console.log(`   ✅ Section ${sectionId} activée`);
        } else {
            console.warn(`   ⚠️ Section ${sectionId} introuvable`);
        }
    });
    
    console.log("✅ [APP-INIT] Toutes les sections utilisateur activées");
}

function desactiverSectionsUtilisateur() {
    console.log("🎨 [APP-INIT] Désactivation sections utilisateur");
    console.log("🔐 [TERMINAL] Interface limitée mode visiteur");
    
    const sectionsUtilisateur = [
        'profilSection',
        'amisConfirmesSection', 
        'chatSection'
    ];
    
    sectionsUtilisateur.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            console.log(`   🙈 Section ${sectionId} masquée`);
        }
    });
    
    console.log("✅ [APP-INIT] Sections utilisateur désactivées");
}

// ========================================
// 📋 SURVEILLANCE CHARGEMENT MODULES
// ========================================
function surveillerChargementModules() {
    console.log("👀 [APP-INIT] Surveillance chargement modules activée");
    console.log("⏱️ [TERMINAL] Attente finalisation chargement tous modules");
    
    const verifierModules = () => {
        // Vérifier si les modules sont disponibles
        modulesCharges.navigation = typeof window.NavigationModule !== 'undefined';
        modulesCharges.profil = typeof window.ProfilModule !== 'undefined';
        modulesCharges.messages = typeof window.MessagesModule !== 'undefined';
        modulesCharges.historique = typeof window.HistoriqueModule !== 'undefined';
        modulesCharges.amis = typeof window.AmisModule !== 'undefined';
        modulesCharges.chat = typeof window.ChatModule !== 'undefined';
        
        const modulesChargésCount = Object.values(modulesCharges).filter(Boolean).length;
        const totalModules = Object.keys(modulesCharges).length;
        
        console.log(`📊 [APP-INIT] État chargement modules: ${modulesChargésCount}/${totalModules}`);
        
        if (modulesChargésCount === totalModules) {
            console.log("🎉 [APP-INIT] TOUS LES MODULES CHARGÉS AVEC SUCCÈS");
            console.log("✅ [TERMINAL] Application complètement opérationnelle");
            finaliserInitialisation();
            return true;
        }
        
        console.log("⏳ [APP-INIT] Modules en attente:", 
            Object.entries(modulesCharges)
                .filter(([nom, charge]) => !charge)
                .map(([nom]) => nom)
        );
        
        return false;
    };
    
    // Vérification immédiate
    if (!verifierModules()) {
        // Vérifications périodiques
        const intervalId = setInterval(() => {
            if (verifierModules()) {
                clearInterval(intervalId);
            }
        }, 100);
        
        // Timeout de sécurité
        setTimeout(() => {
            clearInterval(intervalId);
            if (!applicationInitialisee) {
                console.warn("⚠️ [APP-INIT] Timeout chargement modules - initialisation partielle");
                console.warn("🚨 [TERMINAL] Certains modules peuvent ne pas être fonctionnels");
                finaliserInitialisation();
            }
        }, 5000);
    }
}

// ========================================
// 🏁 FINALISATION INITIALISATION
// ========================================
function finaliserInitialisation() {
    console.log("🏁 [APP-INIT] === FINALISATION INITIALISATION APPLICATION ===");
    console.log("🎯 [TERMINAL] Configuration finale et activation complète");
    
    try {
        // Marquer comme initialisé
        applicationInitialisee = true;
        
        // Vérifier l'état utilisateur final
        const utilisateur = verifierEtatUtilisateur();
        
        // Configurer la surveillance continue de l'état utilisateur
        configurerSurveillanceUtilisateur();
        
        // Afficher les statistiques finales
        afficherStatistiquesApplication();
        
        // Notification de succès
        console.log("🎉 [APP-INIT] === APPLICATION INITIALISÉE AVEC SUCCÈS ===");
        console.log("✅ [TERMINAL] Chez Nous v2.0 OPTIMISÉ - Prêt à l'emploi");
        console.log("🚀 [TERMINAL] Toutes les fonctionnalités sont opérationnelles");
        
        // Petite notification utilisateur (optionnelle)
        if (utilisateur) {
            console.log(`👋 [TERMINAL] Bienvenue ${utilisateur.prenom} ! L'application est prête.`);
        } else {
            console.log("🔐 [TERMINAL] Mode visiteur - Connectez-vous pour accéder à toutes les fonctionnalités");
        }
        
    } catch (error) {
        console.error("💥 [APP-INIT] ERREUR lors de la finalisation:", error.message);
        console.error("🚨 [TERMINAL] Échec finalisation - fonctionnalités limitées possibles");
    }
}

// ========================================
// 👀 SURVEILLANCE CONTINUE UTILISATEUR
// ========================================
function configurerSurveillanceUtilisateur() {
    console.log("👀 [APP-INIT] Configuration surveillance continue utilisateur");
    console.log("🔄 [TERMINAL] Écoute changements état connexion");
    
    let dernierEtatUser = localStorage.getItem('user');
    
    const surveillanceInterval = setInterval(() => {
        const etatActuelUser = localStorage.getItem('user');
        
        // Détecter changement d'état
        if (etatActuelUser !== dernierEtatUser) {
            console.log("🔄 [APP-INIT] Changement état utilisateur détecté");
            console.log("♻️ [TERMINAL] Mise à jour interface automatique");
            
            // Mettre à jour l'affichage
            if (etatActuelUser) {
                console.log("👤 [APP-INIT] Utilisateur connecté - activation interface");
                activerSectionsUtilisateur();
            } else {
                console.log("👋 [APP-INIT] Utilisateur déconnecté - désactivation interface");
                desactiverSectionsUtilisateur();
            }
            
            // Notifier les modules du changement
            if (window.NavigationModule) {
                window.NavigationModule.mettreAJourUtilisateur();
            }
            if (window.ProfilModule) {
                window.ProfilModule.actualiser();
            }
            
            dernierEtatUser = etatActuelUser;
            console.log("✅ [APP-INIT] Interface mise à jour selon nouvel état utilisateur");
        }
    }, 1000);
    
    console.log("✅ [APP-INIT] Surveillance utilisateur configurée (vérification chaque seconde)");
}

// ========================================
// 📊 AFFICHAGE STATISTIQUES APPLICATION
// ========================================
function afficherStatistiquesApplication() {
    console.log("📊 [APP-INIT] === STATISTIQUES APPLICATION ===");
    console.log("📈 [TERMINAL] Récapitulatif état système:");
    
    // Modules
    console.log("🔧 [TERMINAL] État des modules:");
    Object.entries(modulesCharges).forEach(([nom, charge]) => {
        console.log(`   ${charge ? '✅' : '❌'} ${nom.toUpperCase()}: ${charge ? 'OPÉRATIONNEL' : 'ÉCHEC'}`);
    });
    
    // Utilisateur
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("👤 [TERMINAL] État utilisateur:");
    console.log(`   ${user._id ? '✅' : '❌'} Connexion: ${user._id ? 'CONNECTÉ' : 'VISITEUR'}`);
    
    // LocalStorage
    const historiquePersonnel = JSON.parse(localStorage.getItem('historiquePersonnel') || '[]');
    const historiqueAmis = JSON.parse(localStorage.getItem('historiqueAmis') || '[]');
    console.log("💾 [TERMINAL] Données locales:");
    console.log(`   📋 Historique personnel: ${historiquePersonnel.length} messages`);
    console.log(`   👥 Historique amis: ${historiqueAmis.length} messages`);
    
    // Performance
    console.log("⚡ [TERMINAL] Performance:");
    console.log(`   🕐 Temps initialisation: ${Date.now() - window.performance.timing.navigationStart}ms`);
    console.log(`   🧠 Modules chargés: ${Object.values(modulesCharges).filter(Boolean).length}/6`);
    
    console.log("📊 [TERMINAL] === FIN STATISTIQUES ===");
}

// ========================================
// 🔄 FONCTION DE REDÉMARRAGE (UTILITAIRE)
// ========================================
function redemarrerApplication() {
    console.log("🔄 [APP-INIT] Redémarrage application demandé");
    console.log("♻️ [TERMINAL] Réinitialisation complète en cours...");
    
    // Réinitialiser les variables
    applicationInitialisee = false;
    Object.keys(modulesCharges).forEach(key => {
        modulesCharges[key] = false;
    });
    
    // Relancer l'initialisation
    setTimeout(() => {
        initialiserApplication();
    }, 500);
}

// ========================================
// 🚀 FONCTION PRINCIPALE D'INITIALISATION
// ========================================
function initialiserApplication() {
    console.log("🚀 [APP-INIT] === DÉBUT INITIALISATION APPLICATION ===");
    console.log("⚡ [TERMINAL] Lancement séquence d'initialisation complète");
    console.log("📅 [TERMINAL] Date/Heure: " + new Date().toLocaleString('fr-FR'));
    
    try {
        // Étape 1: Vérifier l'état utilisateur
        console.log("🔍 [APP-INIT] ÉTAPE 1/3: Vérification état utilisateur");
        verifierEtatUtilisateur();
        
        // Étape 2: Démarrer la surveillance des modules
        console.log("👀 [APP-INIT] ÉTAPE 2/3: Surveillance chargement modules");
        surveillerChargementModules();
        
        // Étape 3: L'étape 3 (finalisation) sera déclenchée automatiquement
        console.log("⏳ [APP-INIT] ÉTAPE 3/3: En attente finalisation automatique");
        
        console.log("✅ [APP-INIT] Séquence d'initialisation lancée avec succès");
        console.log("⏱️ [TERMINAL] Attente chargement complet des modules...");
        
    } catch (error) {
        console.error("💥 [APP-INIT] ERREUR CRITIQUE lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation application:", error.stack);
        console.error("🆘 [TERMINAL] L'application peut ne pas fonctionner correctement");
    }
}

// ========================================
// 📱 AUTO-INITIALISATION AU CHARGEMENT DOM
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [APP-INIT] DOM chargé - Démarrage application");
    console.log("🌍 [TERMINAL] Environnement: " + navigator.userAgent.substring(0, 50) + "...");
    console.log("📱 [TERMINAL] Résolution: " + window.innerWidth + "x" + window.innerHeight);
    
    // Petite temporisation pour s'assurer que tout est prêt
    setTimeout(() => {
        initialiserApplication();
    }, 100);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.AppInit = {
    initialiser: initialiserApplication,
    redemarrer: redemarrerApplication,
    verifierUtilisateur: verifierEtatUtilisateur,
    activerSections: activerSectionsUtilisateur,
    desactiverSections: desactiverSectionsUtilisateur,
    statistiques: afficherStatistiquesApplication,
    etat: {
        initialise: () => applicationInitialisee,
        modules: () => modulesCharges
    }
};

console.log("✅ [APP-INIT] === MODULE D'INITIALISATION DÉFINI ===");
console.log("🌍 [TERMINAL] Module d'initialisation disponible globalement");
console.log("🎯 [TERMINAL] Chez Nous - Système d'initialisation v2.0 prêt");
