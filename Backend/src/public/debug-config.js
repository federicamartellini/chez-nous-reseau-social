// ========================================
// CONFIGURATION DEBUG - CHEZ NOUS
// Désactivation des outils de debug minifiés
// ========================================

console.log('🔧 [DEBUG] Configuration debug chargée');

// Forcer le mode développement pour éviter les erreurs minifiées
window.__DEV__ = true;
if (typeof process !== 'undefined') {
    process.env.NODE_ENV = 'development';
}

// Désactiver React DevTools si présent
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    try {
        // Neutraliser les hooks React DevTools
        for (let property in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property] === 'function') {
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property] = function() {};
            }
        }
        console.log('✅ [DEBUG] React DevTools neutralisé');
    } catch (error) {
        console.warn('⚠️ [DEBUG] Impossible de neutraliser React DevTools:', error.message);
    }
}

// Désactiver autres DevTools problématiques
if (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
    window.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    console.log('✅ [DEBUG] Redux DevTools désactivé');
}

// Filtrer les erreurs des outils de développement
const originalConsoleError = console.error;
console.error = function(...args) {
    const message = args.join(' ');
    
    // Ignorer les erreurs connues des DevTools
    if (message.includes('Minified React error') || 
        message.includes('inspector.') ||
        message.includes('devtools') ||
        message.includes('extension') ||
        message.includes('b9415ea5.js')) {
        console.warn('⚠️ [DEBUG] Erreur DevTools ignorée:', message.substring(0, 100) + '...');
        return;
    }
    
    // Afficher les vraies erreurs de l'application
    originalConsoleError.apply(console, args);
};

console.log('✅ [DEBUG] Configuration debug terminée - Erreurs DevTools filtrées');
