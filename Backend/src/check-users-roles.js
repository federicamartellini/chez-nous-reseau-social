const Abitante = require('./models/abitante');
const mongoose = require('mongoose');

async function checkUsersRoles() {
    try {
        await mongoose.connect('mongodb+srv://federica:federica@cheznous-cluster.y0zjmjr.mongodb.net/chezNousDB?retryWrites=true&w=majority&appName=cheznous-cluster');
        console.log('Connected to MongoDB');
        
        const users = await Abitante.find({}, { nom: 1, prenom: 1, email: 1, role: 1 });
        
        console.log('=== UTILISATEURS ET RÔLES ===');
        users.forEach(user => {
            console.log(`${user.nom} ${user.prenom} (${user.email}) - Rôle: ${user.role}`);
        });
        
        console.log('\n=== ANALYSE DES RÔLES ===');
        const roles = {};
        users.forEach(user => {
            roles[user.role] = (roles[user.role] || 0) + 1;
        });
        
        Object.entries(roles).forEach(([role, count]) => {
            console.log(`${role}: ${count} utilisateur(s)`);
        });
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

checkUsersRoles();
