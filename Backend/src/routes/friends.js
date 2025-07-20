const express = require('express');
const router = express.Router();
const Abitante = require('../models/abitante');
const mongoose = require('mongoose');

// Middleware pour vérifier si l'utilisateur est connecté (à adapter selon ton auth)
function requireUser(req, res, next) {
    req.userId = req.body.userId || req.query.userId;
    console.log('🔑 userId reçu:', req.userId);
    if (!req.userId) return res.status(401).json({ message: "Non connecté" });
    next();
}

// Récupérer tous les membres (sauf soi-même)
router.get('/membres', requireUser, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId); // <-- CORRECTION ICI
        const membres = await Abitante.find({ _id: { $ne: userId } })
            .select('nom prenom pseudonyme photo role');
        console.log('📋 Liste des membres récupérée:', membres.length, 'membres trouvés');
        res.json(membres);
    } catch (error) {
        console.error('❌ Erreur récupération membres:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer les amis confirmés
router.get('/amis', requireUser, async (req, res) => {
    try {
        const user = await Abitante.findById(req.userId).populate('amis', 'nom prenom pseudonyme photo role');
        console.log('👥 Amis confirmés récupérés');
        res.json(user.amis);
    } catch (error) {
        console.error('❌ Erreur récupération amis:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer les demandes envoyées
router.get('/demandes-envoyees', requireUser, async (req, res) => {
    try {
        const user = await Abitante.findById(req.userId).populate('demandesEnvoyees', 'nom prenom pseudonyme photo role');
        console.log('📤 Demandes envoyées récupérées');
        res.json(user.demandesEnvoyees);
    } catch (error) {
        console.error('❌ Erreur récupération demandes envoyées:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer les demandes reçues
router.get('/demandes-recues', requireUser, async (req, res) => {
    try {
        const user = await Abitante.findById(req.userId).populate('demandesRecues', 'nom prenom pseudonyme photo role');
        console.log('📥 Demandes reçues récupérées');
        res.json(user.demandesRecues);
    } catch (error) {
        console.error('❌ Erreur récupération demandes reçues:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Envoyer une demande d'amitié
router.post('/demander', requireUser, async (req, res) => {
    const { cibleId } = req.body;
    try {
        const user = await Abitante.findById(req.userId);
        const cible = await Abitante.findById(cibleId);

        if (!user || !cible) return res.status(404).json({ message: "Utilisateur non trouvé" });

        // Vérifie si déjà amis ou demande déjà envoyée
        if (user.amis.includes(cibleId) || user.demandesEnvoyees.includes(cibleId)) {
            return res.status(400).json({ message: "Déjà ami ou demande déjà envoyée" });
        }

        user.demandesEnvoyees.push(cibleId);
        cible.demandesRecues.push(user._id);

        await user.save();
        await cible.save();

        console.log(`📨 Demande d'amitié envoyée de ${user.email} à ${cible.email}`);
        res.json({ message: "Demande envoyée" });
    } catch (error) {
        console.error('❌ Erreur envoi demande:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Accepter une demande d'amitié
router.post('/accepter', requireUser, async (req, res) => {
    const { demandeurId } = req.body;
    try {
        const user = await Abitante.findById(req.userId);
        const demandeur = await Abitante.findById(demandeurId);

        if (!user || !demandeur) return res.status(404).json({ message: "Utilisateur non trouvé" });

        // Vérifie que la demande existe
        if (!user.demandesRecues.includes(demandeurId)) {
            return res.status(400).json({ message: "Pas de demande à accepter" });
        }

        // Ajoute chacun dans la liste d'amis de l'autre
        user.amis.push(demandeurId);
        demandeur.amis.push(user._id);

        // Retire la demande
        user.demandesRecues = user.demandesRecues.filter(id => id.toString() !== demandeurId);
        demandeur.demandesEnvoyees = demandeur.demandesEnvoyees.filter(id => id.toString() !== user._id.toString());

        await user.save();
        await demandeur.save();

        console.log(`✅ Demande d'amitié acceptée entre ${user.email} et ${demandeur.email}`);
        res.json({ message: "Ami confirmé" });
    } catch (error) {
        console.error('❌ Erreur acceptation demande:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Supprimer un membre (admin uniquement)
router.delete('/supprimer/:id', requireUser, async (req, res) => {
    try {
        const admin = await Abitante.findById(req.userId);
        if (admin.role !== 'admin') return res.status(403).json({ message: "Accès refusé" });

        await Abitante.findByIdAndDelete(req.params.id);
        console.log(`🗑️ Membre supprimé par admin: ${req.params.id}`);
        res.json({ message: "Membre supprimé" });
    } catch (error) {
        console.error('❌ Erreur suppression membre:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;