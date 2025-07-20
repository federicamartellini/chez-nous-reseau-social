const express = require('express');
const router = express.Router();


router.get('/about', (req, res) => {
  console.log('GET /about');
  res.send('Page à propos');
});

module.exports = router;