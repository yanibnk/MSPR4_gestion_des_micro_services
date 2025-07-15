const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const Utilisateur = require('../models/utilisateur');

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).select('-motdepasse');
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
