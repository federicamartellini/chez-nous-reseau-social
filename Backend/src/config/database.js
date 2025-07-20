const mongoose = require('mongoose');

// Configuration MongoDB avec gestion d'erreurs améliorée
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cheznous';

console.log('🔄 Tentative de connexion à MongoDB...');
console.log('📍 URI utilisé:', MONGODB_URI ? MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Non défini');

// Vérifier si mongoose n'est pas déjà connecté
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('✅ Connexion à MongoDB réussie');
        console.log('📊 Base de données:', mongoose.connection.name);
    })
    .catch((err) => {
        console.error('❌ Erreur de connexion à MongoDB :', err.message);
        console.error('🔍 Vérifiez vos variables d\'environnement MONGODB_URI');
    });
} else {
    console.log('✅ MongoDB déjà connecté');
}

module.exports = mongoose;