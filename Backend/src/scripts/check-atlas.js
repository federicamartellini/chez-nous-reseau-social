// ========================================
// 🔍 SCRIPT DE VÉRIFICATION MONGODB ATLAS
// Examine votre VRAIE base de données cloud
// ========================================

const mongoose = require('mongoose');

async function examinerAtlas() {
    try {
        console.log('🔄 Connexion à MongoDB Atlas (cloud)...');
        
        // URI MongoDB Atlas - remplacez par votre vraie URI Atlas
        // Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
        const ATLAS_URI = 'mongodb+srv://render-user:pJW3fD93bCNOdgYu@cheznous-cluster.y0zjmjr.mongodb.net/france';
        
        // Connexion à Atlas
        await mongoose.connect(ATLAS_URI);
        
        console.log('✅ Connecté à MongoDB Atlas (cloud)');
        
        // Obtenir les informations de la base
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        
        console.log('\n📊 INFORMATIONS DE LA BASE DE DONNÉES ATLAS');
        console.log('=============================================');
        console.log(`📁 Nom de la base: ${dbName}`);
        console.log(`🌐 Type: MongoDB Atlas (cloud)`);
        
        // Lister toutes les collections
        const collections = await db.listCollections().toArray();
        
        console.log(`📄 Nombre de collections: ${collections.length}`);
        console.log('\n🗂️ COLLECTIONS TROUVÉES:');
        console.log('========================');
        
        for (const collection of collections) {
            const collectionName = collection.name;
            const count = await db.collection(collectionName).countDocuments();
            
            console.log(`📄 ${collectionName} (${count} documents)`);
            
            // Afficher un exemple de document si la collection n'est pas vide
            if (count > 0) {
                const sampleDoc = await db.collection(collectionName).findOne();
                console.log(`   Exemple de structure:`);
                console.log(`   ${JSON.stringify(Object.keys(sampleDoc), null, 2)}`);
                console.log('');
            }
        }
        
        // Examiner spécifiquement la collection 'abitanti'
        if (collections.some(c => c.name === 'abitanti')) {
            console.log('\n👥 ANALYSE DÉTAILLÉE - COLLECTION ABITANTI (ATLAS)');
            console.log('===================================================');
            
            const abitanti = db.collection('abitanti');
            const totalMembres = await abitanti.countDocuments();
            
            console.log(`👤 Total des membres: ${totalMembres}`);
            
            if (totalMembres > 0) {
                // Compter par rôle
                const roles = await abitanti.aggregate([
                    { $group: { _id: '$role', count: { $sum: 1 } } }
                ]).toArray();
                
                console.log('\n📊 Répartition par rôles:');
                roles.forEach(role => {
                    console.log(`   ${role._id || 'non défini'}: ${role.count} membres`);
                });
                
                // Compter par région
                const regions = await abitanti.aggregate([
                    { $group: { _id: '$region', count: { $sum: 1 } } }
                ]).toArray();
                
                console.log('\n🌍 Répartition par régions:');
                regions.forEach(region => {
                    console.log(`   ${region._id || 'non défini'}: ${region.count} membres`);
                });
                
                // Afficher quelques exemples de membres (sans mot de passe)
                const exemplesMembres = await abitanti.find({}, {
                    nom: 1,
                    prenom: 1,
                    pseudonyme: 1,
                    region: 1,
                    role: 1,
                    email: 1,
                    amis: 1,
                    demandesEnvoyees: 1,
                    demandesRecues: 1
                }).limit(5).toArray();
                
                console.log('\n👥 Exemples de membres dans Atlas:');
                exemplesMembres.forEach((membre, index) => {
                    console.log(`   ${index + 1}. ${membre.prenom} ${membre.nom} (@${membre.pseudonyme})`);
                    console.log(`      Email: ${membre.email}`);
                    console.log(`      Rôle: ${membre.role}`);
                    console.log(`      Région: ${membre.region || 'Non définie'}`);
                    console.log(`      Amis: ${membre.amis ? membre.amis.length : 0}`);
                    console.log(`      Demandes envoyées: ${membre.demandesEnvoyees ? membre.demandesEnvoyees.length : 0}`);
                    console.log(`      Demandes reçues: ${membre.demandesRecues ? membre.demandesRecues.length : 0}`);
                    console.log('');
                });
            }
        }
        
        // Examiner spécifiquement la collection 'chatmessages'
        if (collections.some(c => c.name === 'chatmessages')) {
            console.log('\n💬 ANALYSE DÉTAILLÉE - COLLECTION CHATMESSAGES (ATLAS)');
            console.log('=======================================================');
            
            const chatmessages = db.collection('chatmessages');
            const totalMessages = await chatmessages.countDocuments();
            
            console.log(`💌 Total des messages: ${totalMessages}`);
            
            if (totalMessages > 0) {
                // Messages récents
                const messagesRecents = await chatmessages.find({})
                    .sort({ date: -1 })
                    .limit(5)
                    .toArray();
                
                console.log('\n📝 Messages récents dans Atlas:');
                messagesRecents.forEach((msg, index) => {
                    console.log(`   ${index + 1}. De: ${msg.expediteurPrenom} ${msg.expediteurNom}`);
                    console.log(`      À: ${msg.destinatairePrenom} ${msg.destinataireNom}`);
                    console.log(`      Date: ${new Date(msg.date).toLocaleString('fr-FR')}`);
                    console.log(`      Message: ${msg.message.substring(0, 50)}...`);
                    console.log(`      Lu: ${msg.lu ? 'Oui' : 'Non'}`);
                    console.log('');
                });
            }
        }
        
        console.log('\n✅ Analyse de MongoDB Atlas terminée');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'examen d\'Atlas:', error);
        console.error('💡 Vérifiez que l\'URI MongoDB Atlas est correcte');
    } finally {
        await mongoose.disconnect();
        console.log('👋 Déconnexion de MongoDB Atlas');
        process.exit(0);
    }
}

// Lancer l'examen d'Atlas
examinerAtlas();
