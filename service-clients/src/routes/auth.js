const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const SECRET_KEY = process.env.SECRET_KEY;

// ✅ POST /auth/register - Inscription d'un nouveau client
router.post('/register',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('motdepasse').isLength({ min: 6 }).withMessage('Mot de passe trop court (min 6 caractères)')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      logger.warn('❌ Erreur validation inscription');
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    const { nom, email, motdepasse } = req.body;

    try {
      // Vérifie si l'email existe déjà
      const utilisateurExistant = await Utilisateur.findOne({ email });
      if (utilisateurExistant) {
        return res.status(409).json({ message: "Email déjà utilisé" });
      }

      // Hash du mot de passe
      const motdepasseHash = await bcrypt.hash(motdepasse, 10);

      const nouvelUtilisateur = new Utilisateur({
        nom,
        email,
        motdepasse: motdepasseHash,
        type: 'client', // par défaut
        statut: 'actif'
      });

      await nouvelUtilisateur.save();
      logger.info(`✅ Nouvelle inscription : ${email}`);
      res.status(201).json({ message: "Inscription réussie" });

    } catch (err) {
      logger.error("❌ Erreur inscription : " + err.message);
      res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
  }
);


router.post('/login', async (req, res) => {
  const { email, motdepasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const passwordValide = await bcrypt.compare(motdepasse, utilisateur.motdepasse);

    if (!passwordValide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: utilisateur._id,
        type: utilisateur.type
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
