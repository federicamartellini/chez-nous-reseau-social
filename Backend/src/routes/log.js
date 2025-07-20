const express = require('express');
const router = express.Router();

router.post('/', (req, res) => { // Log client actions
    const { type, action, amiId, expediteur, message } = req.body; // Destructure the request body
    console.log(`[LOG CLIENT] Action: ${action}, Ami: ${amiId}, Expediteur: ${expediteur}, Message: ${message}`);
    res.json({ status: 'ok' }); // Respond with a JSON object indicating success
});

module.exports = router; // Export the router to be used in the main app