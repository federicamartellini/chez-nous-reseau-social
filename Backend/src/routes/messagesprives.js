const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'france';

// Enregistrer un message privé
router.post('/', async (req, res) => {
    const { destinataire, message, expediteur } = req.body;
    console.log("[Serveur] POST /api/messagesprives", { destinataire, expediteur, message });

    if (!message || !destinataire || !expediteur) {
        console.log("[Serveur] Erreur : message, expediteur ou destinataire manquant");
        return res.status(400).json({ message: "Message, expediteur ou destinataire manquant" });
    }

    try {
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messageprives');
        const result = await collection.insertOne({
            destinataire,
            expediteur,
            message,
            date: new Date()
        });
        console.log("[Serveur] Message privé enregistré :", result.insertedId);
        await client.close();
        res.json({ message: "Message enregistré", id: result.insertedId });
    } catch (err) {
        console.error("[Serveur] Erreur MongoDB :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer les messages privés pour un destinataire
router.get('/:destinataire', async (req, res) => {
    const destinataire = req.params.destinataire;
    console.log("[Serveur] GET /api/messagesprives/" + destinataire);

    try {
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messageprives');
        // On ne retourne que les messages où le destinataire correspond à l'utilisateur connecté
        const messages = await collection.find({ destinataire }).sort({ date: -1 }).toArray();
        console.log(`[Serveur] Messages récupérés pour ${destinataire} :`, messages.length);
        await client.close();
        res.json(messages);
    } catch (err) {
        console.error("[Serveur] Erreur MongoDB :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;