const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'france';

// Enregistrer un message personnel
router.post('/', async (req, res) => {
    const { proprietaire, message } = req.body;
    console.log("[Serveur] POST /api/messagespersonnels", { proprietaire, message });

    if (!message || !proprietaire) {
        return res.status(400).json({ message: "Message ou propriétaire manquant" });
    }

    try {
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagespersonnels');
        const result = await collection.insertOne({
            proprietaire, // l'ID ou l'email du propriétaire du profil
            message,
            date: new Date()
        });
        console.log("[Serveur] Message personnel enregistré :", result.insertedId);
        await client.close();
        res.json({ message: "Message personnel enregistré", id: result.insertedId });
    } catch (err) {
        console.error("[Serveur] Erreur MongoDB :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer l'historique des messages personnels d'un profil
router.get('/:proprietaire', async (req, res) => {
    const proprietaire = req.params.proprietaire;
    console.log("[Serveur] GET /api/messagespersonnels/" + proprietaire);

    try {
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection('messagespersonnels');
        const messages = await collection.find({ proprietaire }).sort({ date: -1 }).toArray();
        console.log(`[Serveur] Messages personnels récupérés pour ${proprietaire} :`, messages.length);
        await client.close();
        res.json(messages);
    } catch (err) {
        console.error("[Serveur] Erreur MongoDB :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;