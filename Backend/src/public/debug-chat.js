// ========================================
// 🧪 SCRIPT DE TEST CHAT TEMPS RÉEL
// Test pour diagnostiquer les problèmes de réception
// ========================================

async function testerChatTempsReel() {
    console.log("🧪 [TEST] === DÉBUT TEST CHAT TEMPS RÉEL ===");
    
    try {
        // Vérifier la connexion Socket.IO
        console.log("🔌 [TEST] Vérification Socket.IO...");
        console.log("Socket connecté:", window.socket ? window.socket.connected : "NON DISPONIBLE");
        
        if (window.socket) {
            console.log("Socket ID:", window.socket.id);
        }
        
        // Vérifier les utilisateurs connectés
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log("👤 [TEST] Utilisateur actuel:", user);
        
        // Tester l'envoi d'un message de test
        if (window.socket && user._id) {
            console.log("📤 [TEST] Envoi message de test...");
            
            const messageTest = {
                expediteurId: user._id,
                expediteurPrenom: user.prenom,
                expediteurNom: user.nom,
                destinataireId: "687d70306d2e0a81b830e9ec", // ID de fedetest
                destinatairePrenom: "fedetest",
                destinataireNom: "fedetest",
                message: "🧪 MESSAGE DE TEST " + new Date().toISOString(),
                date: new Date().toISOString()
            };
            
            // Écouter les confirmations
            window.socket.once('message-envoye-confirmation', (confirmation) => {
                console.log("✅ [TEST] Confirmation reçue:", confirmation);
            });
            
            // Envoyer le message
            window.socket.emit('envoyer-message-chat', messageTest);
            console.log("📨 [TEST] Message de test envoyé via Socket.IO");
            
            // Tester aussi via HTTP
            const res = await fetch('/api/chat/envoyer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageTest)
            });
            
            if (res.ok) {
                const reponse = await res.json();
                console.log("✅ [TEST] Réponse HTTP:", reponse);
            } else {
                console.error("❌ [TEST] Erreur HTTP:", res.status);
            }
        }
        
        // Vérifier les gestionnaires d'événements
        console.log("🎧 [TEST] Vérification gestionnaires Socket.IO...");
        if (window.socket) {
            console.log("Événements Socket.IO enregistrés:", Object.keys(window.socket._callbacks || {}));
        }
        
        // Vérifier le chat module
        console.log("📱 [TEST] Vérification ChatModule...");
        console.log("ChatModule disponible:", typeof window.ChatModule);
        
        if (window.ChatModule) {
            console.log("Fonctions ChatModule:", Object.keys(window.ChatModule));
        }
        
    } catch (error) {
        console.error("💥 [TEST] Erreur lors du test:", error);
    }
    
    console.log("🏁 [TEST] === FIN TEST CHAT TEMPS RÉEL ===");
}

// Exposer la fonction globalement pour pouvoir l'appeler depuis la console
window.testerChatTempsReel = testerChatTempsReel;

console.log("🧪 [TEST] Script de test chat chargé. Utilisez: testerChatTempsReel()");
