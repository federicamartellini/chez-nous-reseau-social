const mongoose = require('mongoose');

const abitanteSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    pseudonyme: String,
    region: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'membre' },
    photo: { type: String, default: '' }, // URL ou chemin de la photo
    amis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abitante' }],
    demandesEnvoyees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abitante' }],
    demandesRecues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abitante' }]
});

// Le nom du modèle ("Abitante") => collection "abitantes" (ou "abitanti" si tu précises le nom)
module.exports = mongoose.model('Abitante', abitanteSchema, 'abitanti');