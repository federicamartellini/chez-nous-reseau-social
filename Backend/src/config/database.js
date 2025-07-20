const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/france';

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connexion à MongoDB réussie');
})
.catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB :', err.message);
});

module.exports = mongoose;