// Configuration de l'URL de base pour les appels API
// Détecte automatiquement si on est en local ou en production

const API_CONFIG = {
    // Déterminer l'URL de base automatiquement
    getBaseURL: function() {
        // Si on est sur localhost, utiliser le serveur local
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        // Sinon, utiliser l'URL de production (même domaine)
        return window.location.origin;
    },
    
    // URL de base pour les appels API
    BASE_URL: null,
    
    // Socket.io URL
    SOCKET_URL: null,
    
    // Initialiser la configuration
    init: function() {
        this.BASE_URL = this.getBaseURL();
        this.SOCKET_URL = this.BASE_URL;
        
        console.log('🌐 [CONFIG] Configuration API initialisée');
        console.log('📍 [CONFIG] Base URL:', this.BASE_URL);
        console.log('🔌 [CONFIG] Socket URL:', this.SOCKET_URL);
    },
    
    // Construire une URL complète pour un endpoint
    url: function(endpoint) {
        // S'assurer que l'endpoint commence par /
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        return this.BASE_URL + endpoint;
    }
};

// Initialiser automatiquement
API_CONFIG.init();

// Rendre disponible globalement
window.API_CONFIG = API_CONFIG;
