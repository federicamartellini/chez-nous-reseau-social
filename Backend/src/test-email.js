// ========================================
// 🧪 TEST EMAIL SERVICE - CHEZ NOUS
// ========================================

console.log("🧪 [TEST] === DÉBUT TEST SERVICE EMAIL ===");

const emailService = require('./utils/emailService');

async function testerEmail() {
    console.log("🧪 [TEST] Lancement des tests du service email...");
    
    // Test 1: Initialisation du transporteur
    console.log("🧪 [TEST] Test 1: Initialisation du transporteur...");
    emailService.initialiserTransporteur();
    
    // Test 2: Test de connexion
    console.log("🧪 [TEST] Test 2: Test de connexion au serveur email...");
    const connexionOk = await emailService.testerConnexionEmail();
    console.log("🧪 [TEST] Résultat test connexion:", connexionOk ? "✅ SUCCÈS" : "❌ ÉCHEC");
    
    // Test 3: Envoi d'email de test (optionnel)
    if (connexionOk) {
        console.log("🧪 [TEST] Test 3: Envoi d'email de bienvenue de test...");
        const utilisateurTest = {
            email: "test@example.com", // Changez par votre email pour tester
            nom: "Utilisateur",
            prenom: "Test"
        };
        
        try {
            const resultat = await emailService.envoyerEmailBienvenue(utilisateurTest);
            console.log("🧪 [TEST] Résultat envoi email:", resultat.success ? "✅ SUCCÈS" : "❌ ÉCHEC");
            if (resultat.success) {
                console.log("🧪 [TEST] ID du message:", resultat.messageId);
            } else {
                console.log("🧪 [TEST] Erreur:", resultat.error);
            }
        } catch (error) {
            console.error("🧪 [TEST] ERREUR lors du test d'envoi:", error.message);
        }
    }
    
    console.log("🧪 [TEST] === FIN TESTS SERVICE EMAIL ===");
}

// Lancer les tests seulement si ce fichier est exécuté directement
if (require.main === module) {
    testerEmail()
        .then(() => {
            console.log("🧪 [TEST] Tous les tests terminés");
            process.exit(0);
        })
        .catch((error) => {
            console.error("🧪 [TEST] ERREUR CRITIQUE:", error);
            process.exit(1);
        });
}

module.exports = { testerEmail };
