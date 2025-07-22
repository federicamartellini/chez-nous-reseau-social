const express = require('express');
const router = express.Router();
const Abitante = require('../models/abitante');

// Inscription
router.post('/register', async (req, res) => {
    const { nom, prenom, pseudonyme, region, email, password } = req.body;
    if (!nom || !prenom || !pseudonyme || !region || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    try {
        const existing = await Abitante.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }
        let userRole = "membre";
        if (['admin@cheznous.fr'].includes(email)) userRole = "admin";
        const newAbitante = new Abitante({
            nom, prenom, pseudonyme, region, email, password, role: userRole
        });
        await newAbitante.save();
        return res.status(201).json({
            message: 'Inscription réussie.',
            _id: newAbitante._id,
            nom: newAbitante.nom,
            prenom: newAbitante.prenom,
            pseudonyme: newAbitante.pseudonyme,
            region: newAbitante.region,
            email: newAbitante.email,
            role: newAbitante.role
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Abitante.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé.' });
        }
        // Vérifie le mot de passe (à adapter si hash)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }
        // AJOUT DU LOG DANS LE TERMINAL
        console.log(`[👤CONNEXION ✅] ${email} vient de se connecter`);
        // ...envoie la réponse...
        res.json({
            _id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            pseudonyme: user.pseudonyme,
            region: user.region,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Déconnexion
router.post('/logout', (req, res) => {
    console.log('POST /users/logout');
    res.json({ message: 'Déconnexion utilisateur' });
});

// Mot de passe oublié
router.post('/forgot-password', (req, res) => {
    console.log('POST /users/forgot-password');
    res.json({ message: 'Mot de passe perdu' });
});

// Profil utilisateur
router.get('/profile', (req, res) => {
    console.log('GET /users/profile');
    res.json({ message: 'Mon profil' });
});

// Recherche de membres
router.get('/search', (req, res) => {
    console.log('GET /users/search');
    res.json({ message: 'Recherche de membres' });
});

// Espace personnel utilisateur
router.get('/:id/space', (req, res) => {
    console.log(`GET /users/${req.params.id}/space`);
    res.json({ message: `Espace personnel de l'utilisateur ${req.params.id}` });
});

module.exports = router;