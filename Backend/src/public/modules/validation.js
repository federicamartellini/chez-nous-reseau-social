// ========================================
// 🧪 SCRIPT DE VALIDATION DES MODULES
// Test automatique de tous les modules optimisés
// ========================================

console.log("🧪 [TEST] === DÉBUT VALIDATION MODULES CHEZ NOUS ===");
console.log("🔍 [TERMINAL] Test automatique de l'architecture modulaire");

// ========================================
// 📋 LISTE DES MODULES À TESTER
// ========================================
const modulesAValider = [
    { nom: 'navigation', variable: 'NavigationModule', fichier: 'navigation.js' },
    { nom: 'profil', variable: 'ProfilModule', fichier: 'profil.js' },
    { nom: 'messages', variable: 'MessagesModule', fichier: 'messages.js' },
    { nom: 'historique', variable: 'HistoriqueModule', fichier: 'historique.js' },
    { nom: 'amis', variable: 'AmisModule', fichier: 'amis.js' },
    { nom: 'chat', variable: 'ChatModule', fichier: 'chat.js' },
    { nom: 'app-init', variable: 'AppInit', fichier: 'app-init.js' }
];

// ========================================
// 📊 VARIABLES DE RÉSULTAT
// ========================================
let testsRéussis = 0;
let testsEchoués = 0;
let erreursDetectées = [];

// ========================================
// 🔍 FONCTION DE VALIDATION D'UN MODULE
// ========================================
function validerModule(moduleInfo) {
    console.log(`🔍 [TEST] Validation module: ${moduleInfo.nom}`);
    console.log(`📁 [TERMINAL] Fichier: ${moduleInfo.fichier}`);
    
    try {
        // Vérifier si le module est chargé
        if (typeof window[moduleInfo.variable] === 'undefined') {
            throw new Error(`Module ${moduleInfo.variable} non trouvé dans window`);
        }
        
        const module = window[moduleInfo.variable];
        console.log(`✅ [TEST] Module ${moduleInfo.nom} trouvé`);
        
        // Vérifier les fonctions essentielles
        const fonctionsEssentielles = ['initialiser'];
        let fonctionsTrouvées = 0;
        
        fonctionsEssentielles.forEach(fonction => {
            if (typeof module[fonction] === 'function') {
                fonctionsTrouvées++;
                console.log(`   ✅ Fonction ${fonction}() disponible`);
            } else {
                console.warn(`   ⚠️ Fonction ${fonction}() manquante`);
            }
        });
        
        // Vérifier les propriétés spécifiques par module
        switch (moduleInfo.nom) {
            case 'navigation':
                if (typeof module.mettreAJourUtilisateur === 'function') {
                    console.log(`   ✅ Fonction spécifique mettreAJourUtilisateur() trouvée`);
                }
                break;
                
            case 'profil':
                if (typeof module.actualiser === 'function') {
                    console.log(`   ✅ Fonction spécifique actualiser() trouvée`);
                }
                break;
                
            case 'messages':
                if (typeof module.chargerPersonnels === 'function') {
                    console.log(`   ✅ Fonction spécifique chargerPersonnels() trouvée`);
                }
                break;
                
            case 'historique':
                if (typeof module.sauvegarderPersonnel === 'function') {
                    console.log(`   ✅ Fonction spécifique sauvegarderPersonnel() trouvée`);
                }
                break;
                
            case 'amis':
                if (typeof module.chargerListe === 'function') {
                    console.log(`   ✅ Fonction spécifique chargerListe() trouvée`);
                }
                break;
                
            case 'chat':
                if (typeof module.envoyerMessage === 'function') {
                    console.log(`   ✅ Fonction spécifique envoyerMessage() trouvée`);
                }
                break;
                
            case 'app-init':
                if (typeof module.redemarrer === 'function') {
                    console.log(`   ✅ Fonction spécifique redemarrer() trouvée`);
                }
                break;
        }
        
        console.log(`✅ [TEST] Module ${moduleInfo.nom} validé avec succès`);
        testsRéussis++;
        return true;
        
    } catch (error) {
        console.error(`❌ [TEST] ÉCHEC validation module ${moduleInfo.nom}:`, error.message);
        erreursDetectées.push(`${moduleInfo.nom}: ${error.message}`);
        testsEchoués++;
        return false;
    }
}

// ========================================
// 🔍 VALIDATION DES ÉLÉMENTS HTML
// ========================================
function validerElementsHTML() {
    console.log("🔍 [TEST] Validation éléments HTML requis");
    
    const elementsRequis = [
        'navToggle',
        'navMenu',
        'profilSection',
        'saveMessagePersonnel',
        'messagesPersonnels',
        'amisConfirmesSection',
        'chatSection',
        'chatInput',
        'sendBtn'
    ];
    
    let elementsManquants = [];
    
    elementsRequis.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`   ✅ Élément #${elementId} trouvé`);
        } else {
            console.warn(`   ⚠️ Élément #${elementId} manquant`);
            elementsManquants.push(elementId);
        }
    });
    
    if (elementsManquants.length === 0) {
        console.log("✅ [TEST] Tous les éléments HTML requis sont présents");
        return true;
    } else {
        console.warn(`⚠️ [TEST] ${elementsManquants.length} éléments HTML manquants`);
        return false;
    }
}

// ========================================
// 🔍 VALIDATION DONNÉES UTILISATEUR
// ========================================
function validerDonneesUtilisateur() {
    console.log("🔍 [TEST] Validation gestion données utilisateur");
    
    try {
        // Tester localStorage
        const testKey = 'test_chez_nous';
        const testValue = { test: true, timestamp: Date.now() };
        
        localStorage.setItem(testKey, JSON.stringify(testValue));
        const retrieved = JSON.parse(localStorage.getItem(testKey));
        
        if (retrieved && retrieved.test === true) {
            console.log("   ✅ localStorage fonctionnel");
            localStorage.removeItem(testKey);
        } else {
            throw new Error("localStorage ne fonctionne pas correctement");
        }
        
        // Vérifier la structure utilisateur
        const userStored = localStorage.getItem('user');
        if (userStored) {
            const user = JSON.parse(userStored);
            console.log("   ✅ Données utilisateur trouvées dans localStorage");
            console.log(`      👤 Utilisateur: ${user.prenom || 'Inconnu'} ${user.nom || ''}`);
        } else {
            console.log("   ℹ️ Aucun utilisateur connecté (normal si pas connecté)");
        }
        
        console.log("✅ [TEST] Gestion données utilisateur validée");
        return true;
        
    } catch (error) {
        console.error("❌ [TEST] Erreur validation données utilisateur:", error.message);
        return false;
    }
}

// ========================================
// 📊 FONCTION PRINCIPALE DE VALIDATION
// ========================================
function lancerValidationComplete() {
    console.log("🚀 [TEST] === LANCEMENT VALIDATION COMPLÈTE ===");
    console.log(`📋 [TERMINAL] ${modulesAValider.length} modules à valider`);
    
    // Valider chaque module
    modulesAValider.forEach(moduleInfo => {
        validerModule(moduleInfo);
    });
    
    // Valider les éléments HTML
    const htmlValide = validerElementsHTML();
    
    // Valider les données utilisateur
    const donneesValides = validerDonneesUtilisateur();
    
    // Rapport final
    console.log("📊 [TEST] === RAPPORT FINAL VALIDATION ===");
    console.log(`✅ [TERMINAL] Modules réussis: ${testsRéussis}/${modulesAValider.length}`);
    console.log(`❌ [TERMINAL] Modules échoués: ${testsEchoués}/${modulesAValider.length}`);
    console.log(`🔍 [TERMINAL] Éléments HTML: ${htmlValide ? 'VALIDES' : 'PROBLÈMES DÉTECTÉS'}`);
    console.log(`💾 [TERMINAL] Données utilisateur: ${donneesValides ? 'VALIDES' : 'PROBLÈMES DÉTECTÉS'}`);
    
    if (erreursDetectées.length > 0) {
        console.log("❌ [TERMINAL] Erreurs détectées:");
        erreursDetectées.forEach(erreur => {
            console.log(`   💥 ${erreur}`);
        });
    }
    
    const tousValides = testsEchoués === 0 && htmlValide && donneesValides;
    
    if (tousValides) {
        console.log("🎉 [TEST] === VALIDATION RÉUSSIE - APPLICATION PRÊTE ===");
        console.log("✅ [TERMINAL] Chez Nous v2.0 optimisé est opérationnel");
        console.log("🚀 [TERMINAL] Toutes les fonctionnalités sont disponibles");
    } else {
        console.warn("⚠️ [TEST] === VALIDATION PARTIELLE - VÉRIFICATIONS NÉCESSAIRES ===");
        console.warn("🔧 [TERMINAL] Certaines fonctionnalités peuvent ne pas marcher");
    }
    
    return tousValides;
}

// ========================================
// ⏰ LANCEMENT AUTOMATIQUE APRÈS CHARGEMENT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [TEST] DOM chargé - Attente chargement modules");
    
    let tentatives = 0;
    const maxTentatives = 10; // Maximum 10 tentatives (5 secondes)
    
    // Attendre que tous les modules soient chargés avec une vérification
    function verifierEtLancerValidation() {
        tentatives++;
        
        // Vérifier si les modules critiques sont chargés avec debug détaillé
        console.log(`🔍 [DEBUG] Tentative ${tentatives} - Vérification window.ChatModule:`, window.ChatModule);
        console.log(`🔍 [DEBUG] window object keys contenant 'Chat':`, Object.keys(window).filter(key => key.includes('Chat')));
        
        const chatModulePresent = typeof window.ChatModule !== 'undefined';
        const messagesModulePresent = typeof window.MessagesModule !== 'undefined';
        const amisModulePresent = typeof window.AmisModule !== 'undefined';
        
        console.log(`🔍 [DEBUG] chatModulePresent: ${chatModulePresent}, type: ${typeof window.ChatModule}`);
        
        if (chatModulePresent && messagesModulePresent && amisModulePresent) {
            console.log("✅ [TEST] Tous les modules principaux détectés - lancement validation");
            console.log(`🔢 [TEST] Modules détectés après ${tentatives} tentative(s)`);
            lancerValidationComplete();
            return;
        }
        
        if (tentatives >= maxTentatives) {
            console.warn("⚠️ [TEST] Limite de tentatives atteinte - arrêt de la vérification");
            console.warn(`❌ [TEST] Modules manquants après ${tentatives} tentatives:`);
            console.warn(`   ChatModule: ${chatModulePresent ? 'PRÉSENT' : 'ABSENT'} (type: ${typeof window.ChatModule})`);
            console.warn(`   MessagesModule: ${messagesModulePresent ? 'PRÉSENT' : 'ABSENT'}`);
            console.warn(`   AmisModule: ${amisModulePresent ? 'PRÉSENT' : 'ABSENT'}`);
            console.warn(`🔍 [DEBUG] window.ChatModule value:`, window.ChatModule);
            return;
        }
        
        if (tentatives === 1 || tentatives % 3 === 0) {
            // Afficher les logs seulement à la première tentative puis toutes les 3 tentatives
            console.log(`⏳ [TEST] Modules en cours de chargement... (tentative ${tentatives}/${maxTentatives})`);
            console.log(`   ChatModule: ${chatModulePresent ? 'PRÉSENT' : 'ABSENT'}`);
            console.log(`   MessagesModule: ${messagesModulePresent ? 'PRÉSENT' : 'ABSENT'}`);
            console.log(`   AmisModule: ${amisModulePresent ? 'PRÉSENT' : 'ABSENT'}`);
        }
        
        // Réessayer dans 500ms
        setTimeout(verifierEtLancerValidation, 500);
    }
    
    // Attendre 3 secondes puis commencer la vérification
    setTimeout(verifierEtLancerValidation, 3000);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.ValidationModules = {
    lancerValidation: lancerValidationComplete,
    validerModule: validerModule,
    validerHTML: validerElementsHTML,
    validerDonnees: validerDonneesUtilisateur
};

console.log("✅ [TEST] === SCRIPT DE VALIDATION DÉFINI ===");
console.log("🌍 [TERMINAL] Validation disponible via window.ValidationModules");
