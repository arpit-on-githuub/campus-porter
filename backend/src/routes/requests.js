const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Request routes working' });
});

module.exports = router;