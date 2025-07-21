const express = require('express');
const router = express.Router();
const Abitante = require('../models/abitante');
const emailService = require('../utils/emailService');

console.log("📧 [USERS] Service email importé pour les inscriptions");

// Inscription
router.post('/register', async (req, res) => {
    const { nom, prenom, pseudonyme, region, email, password } = req.body;
    console.log("📝 [INSCRIPTION] === DÉBUT NOUVELLE INSCRIPTION ===");
    console.log("👤 [INSCRIPTION] Tentative d'inscription pour:", email);
    console.log("🕐 [INSCRIPTION] Timestamp:", new Date().toISOString());
    console.log("📊 [INSCRIPTION] Données reçues:");
    console.log("   📝 Nom:", nom);
    console.log("   👤 Prénom:", prenom);
    console.log("   🏷️ Pseudonyme:", pseudonyme);
    console.log("   🌍 Région:", region);
    console.log("   📧 Email:", email);
    console.log("   🔐 Mot de passe:", password ? "Fourni" : "Manquant");
    
    if (!nom || !prenom || !pseudonyme || !region || !email || !password) {
        console.warn("❌ [INSCRIPTION] ÉCHEC - Champs obligatoires manquants");
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    
    try {
        console.log("🔍 [INSCRIPTION] Vérification de l'unicité de l'email...");
        const existing = await Abitante.findOne({ email });
        if (existing) {
            console.warn("❌ [INSCRIPTION] ÉCHEC - Email déjà utilisé:", email);
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }
        
        console.log("✅ [INSCRIPTION] Email disponible, attribution du rôle...");
        let userRole = "membre";
        if (['admin@cheznous.fr'].includes(email)) {
            userRole = "admin";
            console.log("🛡️ [INSCRIPTION] Rôle admin attribué automatiquement");
        } else {
            console.log("👤 [INSCRIPTION] Rôle membre attribué par défaut");
        }
        
        console.log("💾 [INSCRIPTION] Création du nouvel utilisateur en base...");
        const newAbitante = new Abitante({
            nom, prenom, pseudonyme, region, email, password, role: userRole
        });
        await newAbitante.save();
        
        console.log("✅ [INSCRIPTION] Utilisateur sauvegardé avec succès");
        console.log("🆔 [INSCRIPTION] ID généré:", newAbitante._id);
        
        // === NOUVELLE FONCTIONNALITÉ : ENVOI EMAIL BIENVENUE ===
        console.log("📧 [INSCRIPTION] === DÉBUT ENVOI EMAIL BIENVENUE ===");
        try {
            const resultatEmail = await emailService.envoyerEmailBienvenue({
                email: newAbitante.email,
                nom: newAbitante.nom,
                prenom: newAbitante.prenom
            });
            
            if (resultatEmail.success) {
                console.log("✅ [INSCRIPTION] Email de bienvenue envoyé avec succès");
                console.log("📧 [INSCRIPTION] ID du message email:", resultatEmail.messageId);
            } else {
                console.warn("⚠️ [INSCRIPTION] Échec envoi email (inscription quand même réussie)");
                console.warn("⚠️ [INSCRIPTION] Erreur email:", resultatEmail.error);
            }
        } catch (emailError) {
            console.error("❌ [INSCRIPTION] ERREUR lors de l'envoi de l'email:");
            console.error("❌ [INSCRIPTION] L'inscription est quand même réussie");
            console.error("❌ [INSCRIPTION] Erreur email:", emailError.message);
        }
        console.log("🏁 [INSCRIPTION] === FIN ENVOI EMAIL BIENVENUE ===");
        
        console.log("✅ [INSCRIPTION] === INSCRIPTION RÉUSSIE COMPLÈTEMENT ===");
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
        console.error("💥 [INSCRIPTION] ERREUR CRITIQUE lors de l'inscription:");
        console.error("💥 [INSCRIPTION] Message:", error.message);
        console.error("💥 [INSCRIPTION] Stack:", error.stack);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
    
    console.log("🏁 [INSCRIPTION] === FIN TRAITEMENT INSCRIPTION ===");
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