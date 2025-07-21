// ========================================
// 🔍 ROUTE TEMPORAIRE POUR ANALYSER ATLAS
// Ajoutez cette route dans votre app.js temporairement
// ========================================

// À ajouter dans votre app.js :

app.get('/debug/database-info', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Abitante = require('./models/abitante');
        
        // Informations de connexion
        const dbName = mongoose.connection.name;
        const connectionState = mongoose.connection.readyState;
        
        // Compter les documents
        const totalMembres = await Abitante.countDocuments();
        
        // Exemples de membres
        const exemplesMembres = await Abitante.find({}, {
            nom: 1,
            prenom: 1, 
            pseudonyme: 1,
            email: 1,
            role: 1,
            region: 1,
            amis: 1,
            demandesEnvoyees: 1,
            demandesRecues: 1
        }).limit(5);
        
        // Statistiques par rôle
        const statsRoles = await Abitante.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        // Statistiques par région  
        const statsRegions = await Abitante.aggregate([
            { $group: { _id: '$region', count: { $sum: 1 } } }
        ]);
        
        const info = {
            database: {
                name: dbName,
                connectionState: connectionState, // 1 = connected
                isAtlas: process.env.MONGODB_URI ? process.env.MONGODB_URI.includes('mongodb.net') : false
            },
            collections: {
                abitanti: {
                    total: totalMembres,
                    statsRoles,
                    statsRegions,
                    exemples: exemplesMembres
                }
            },
            timestamp: new Date().toISOString()
        };
        
        res.json(info);
        
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
