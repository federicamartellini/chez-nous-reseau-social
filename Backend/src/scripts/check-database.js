// ========================================
// 🔍 SCRIPT DE VÉRIFICATION BASE DE DONNÉES
// Examine la structure de votre MongoDB Atlas
// ========================================

const mongoose = require('mongoose');
require('dotenv').config();

async function examinerBaseDeDonnees() {
    try {
        console.log('🔄 Connexion à MongoDB Atlas...');
        
        // Pour Atlas, utiliser l'URI de production
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://render-user:RlJiMaIklhFNk84x@cheznous-cluster.y0zjmjr.mongodb.net/cheznous?retryWrites=true&w=majority&appName=cheznous-cluster';
        
        console.log('🔗 URI utilisée:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI non définie');
            return;
        }
        
        // Connexion
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connecté à MongoDB Atlas');
        
        // Obtenir les informations de la base
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        
        console.log('\n📊 INFORMATIONS DE LA BASE DE DONNÉES');
        console.log('=====================================');
        console.log(`📁 Nom de la base: ${dbName}`);
        
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
            console.log('\n👥 ANALYSE DÉTAILLÉE - COLLECTION ABITANTI');
            console.log('==========================================');
            
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
                    email: 1
                }).limit(3).toArray();
                
                console.log('\n👥 Exemples de membres:');
                exemplesMembres.forEach((membre, index) => {
                    console.log(`   ${index + 1}. ${membre.prenom} ${membre.nom} (@${membre.pseudonyme})`);
                    console.log(`      Email: ${membre.email}`);
                    console.log(`      Rôle: ${membre.role}`);
                    console.log(`      Région: ${membre.region || 'Non définie'}`);
                    console.log('');
                });
            }
        }
        
        // Examiner spécifiquement la collection 'chatmessages'
        if (collections.some(c => c.name === 'chatmessages')) {
            console.log('\n💬 ANALYSE DÉTAILLÉE - COLLECTION CHATMESSAGES');
            console.log('===============================================');
            
            const chatmessages = db.collection('chatmessages');
            const totalMessages = await chatmessages.countDocuments();
            
            console.log(`💌 Total des messages: ${totalMessages}`);
            
            if (totalMessages > 0) {
                // Messages récents
                const messagesRecents = await chatmessages.find({})
                    .sort({ date: -1 })
                    .limit(3)
                    .toArray();
                
                console.log('\n📝 Messages récents:');
                messagesRecents.forEach((msg, index) => {
                    console.log(`   ${index + 1}. De: ${msg.expediteurPrenom} ${msg.expediteurNom}`);
                    console.log(`      À: ${msg.destinatairePrenom} ${msg.destinataireNom}`);
                    console.log(`      Date: ${new Date(msg.date).toLocaleString('fr-FR')}`);
                    console.log(`      Message: ${msg.message.substring(0, 50)}...`);
                    console.log('');
                });
            }
        }
        
        console.log('\n✅ Analyse terminée');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'examen de la base:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Déconnexion de MongoDB');
        process.exit(0);
    }
}

// Lancer l'examen
examinerBaseDeDonnees();
