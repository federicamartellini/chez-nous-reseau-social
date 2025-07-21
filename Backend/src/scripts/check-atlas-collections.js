// ========================================
// 🌩️ SCRIPT DE VÉRIFICATION MONGODB ATLAS
// Examine les collections dans votre cloud
// ========================================

const mongoose = require('mongoose');

async function examinerCollectionsAtlas() {
    try {
        console.log('🌩️ Connexion à MongoDB Atlas...');
        
        // URI Atlas directe (sans variables d'environnement locales)
        const ATLAS_URI = 'mongodb+srv://render-user:RlJiMaIklhFNk84x@cheznous-cluster.y0zjmjr.mongodb.net/cheznous?retryWrites=true&w=majority&appName=cheznous-cluster';
        
        console.log('🔗 Connexion à Atlas...');
        
        // Connexion à Atlas
        await mongoose.connect(ATLAS_URI);
        
        console.log('✅ Connecté à MongoDB Atlas');
        
        // Obtenir les informations de la base
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        
        console.log('\n📊 INFORMATIONS DE LA BASE ATLAS');
        console.log('=================================');
        console.log(`📁 Nom de la base: ${dbName}`);
        console.log(`🌐 Cluster: cheznous-cluster.y0zjmjr.mongodb.net`);
        
        // Lister toutes les collections
        const collections = await db.listCollections().toArray();
        
        console.log(`📄 Nombre de collections: ${collections.length}`);
        console.log('\n🗂️ COLLECTIONS ATLAS:');
        console.log('=====================');
        
        if (collections.length === 0) {
            console.log('   Aucune collection trouvée dans Atlas');
        } else {
            for (const collection of collections) {
                const collectionName = collection.name;
                const count = await db.collection(collectionName).countDocuments();
                
                console.log(`📄 ${collectionName} (${count} documents)`);
                
                // Afficher un exemple de document si la collection n'est pas vide
                if (count > 0) {
                    const sampleDoc = await db.collection(collectionName).findOne();
                    const fields = Object.keys(sampleDoc).filter(key => key !== '_id');
                    console.log(`   📋 Champs: ${fields.join(', ')}`);
                    console.log('');
                }
            }
        }
        
        // Examiner spécifiquement la collection 'abitanti' dans Atlas
        if (collections.some(c => c.name === 'abitanti')) {
            console.log('\n👥 DÉTAILS - COLLECTION ABITANTI (ATLAS)');
            console.log('=========================================');
            
            const abitanti = db.collection('abitanti');
            const totalMembres = await abitanti.countDocuments();
            
            console.log(`👤 Total des membres dans Atlas: ${totalMembres}`);
            
            if (totalMembres > 0) {
                // Tous les membres
                const membres = await abitanti.find({}, {
                    nom: 1,
                    prenom: 1,
                    pseudonyme: 1,
                    region: 1,
                    role: 1,
                    email: 1,
                    amis: 1,
                    demandesEnvoyees: 1,
                    demandesRecues: 1
                }).toArray();
                
                console.log('\n👥 Liste complète des membres Atlas:');
                membres.forEach((membre, index) => {
                    console.log(`   ${index + 1}. ${membre.prenom} ${membre.nom} (@${membre.pseudonyme})`);
                    console.log(`      📧 Email: ${membre.email}`);
                    console.log(`      🎭 Rôle: ${membre.role}`);
                    console.log(`      🌍 Région: ${membre.region || 'Non définie'}`);
                    console.log(`      👥 Amis: ${membre.amis ? membre.amis.length : 0}`);
                    console.log(`      📤 Demandes envoyées: ${membre.demandesEnvoyees ? membre.demandesEnvoyees.length : 0}`);
                    console.log(`      📥 Demandes reçues: ${membre.demandesRecues ? membre.demandesRecues.length : 0}`);
                    console.log('');
                });
            }
        }
        
        // Autres collections importantes
        console.log('\n📊 RÉSUMÉ DES COLLECTIONS ATLAS');
        console.log('===============================');
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`📄 ${collection.name}: ${count} documents`);
        }
        
        console.log('\n✅ Analyse Atlas terminée');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'examen d\'Atlas:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Déconnexion d\'Atlas');
        process.exit(0);
    }
}

// Lancer l'examen d'Atlas
examinerCollectionsAtlas();
