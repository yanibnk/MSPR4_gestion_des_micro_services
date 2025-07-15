const express = require('express');
const routeur = express.Router();
const Utilisateur = require('../models/utilisateur');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/auth');
const { publierSuppressionClient } = require('../rabbitmq/publisher');
const bcrypt = require('bcryptjs');

// ✅ Créer un utilisateur (avec validation)
routeur.post(
  '/',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('motdepasse').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
    body('type').optional().isIn(['client', 'admin']).withMessage('Type invalide'),
    body('statut').optional().isIn(['actif', 'bloqué']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      logger.warn("❌ Requête invalide pour création utilisateur");
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.motdepasse, 10);

      const nouvelUtilisateur = new Utilisateur({
        ...req.body,
        motdepasse: hashedPassword
      });

      await nouvelUtilisateur.save();
      logger.info("✅ Utilisateur créé : " + nouvelUtilisateur.email);
      res.status(201).json(nouvelUtilisateur);
    } catch (erreur) {
      logger.error("❌ Erreur lors de la création : " + erreur.message);
      res.status(400).send("Erreur lors de la création");
    }
  }
);

// ✅ Lire tous les utilisateurs
routeur.get('/', async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find().sort({ createdAt: -1 });
    logger.info("📥 Récupération de tous les utilisateurs triés par date décroissante");
    res.json(utilisateurs);
  } catch (erreur) {
    res.status(500).send("Erreur serveur");
  }
});


// ✅ Lire ses propres infos
routeur.get('/me', isAuthenticated, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).select('-motdepasse');
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (err) {
    logger.error("❌ Erreur dans /me :", err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
});

// ✅ Lire un utilisateur par ID
routeur.get('/:id', async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    logger.info(`🔍 Récupération de l'utilisateur ID : ${req.params.id}`);
    if (!utilisateur) return res.status(404).send("Utilisateur non trouvé");
    res.json(utilisateur);
  } catch (erreur) {
    res.status(500).send("Erreur lors de la récupération");
  }
});

// ✅ Modifier un utilisateur (avec validation)
routeur.put('/:id',
  [
    body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('motdepasse').optional().isLength({ min: 6 }).withMessage('Mot de passe trop court'),
    body('type').optional().isIn(['client', 'admin']).withMessage('Type invalide'),
    body('statut').optional().isIn(['actif', 'bloqué']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    try {
      if (req.body.motdepasse) {
        req.body.motdepasse = await bcrypt.hash(req.body.motdepasse, 10);
      }

      const modifie = await Utilisateur.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!modifie) return res.status(404).send("Utilisateur non trouvé");
      res.json(modifie);
    } catch (erreur) {
      res.status(400).send("Erreur de modification");
    }
  }
);

// ✅ Supprimer un utilisateur (admin seulement + RabbitMQ)
routeur.delete('/:id', isAdmin, async (req, res) => {
  try {
    const supprime = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!supprime) return res.status(404).send("Utilisateur non trouvé");

    publierSuppressionClient(req.params.id); // RabbitMQ
    res.send("Utilisateur supprimé");
  } catch (erreur) {
    res.status(500).send("Erreur de suppression");
  }
});

module.exports = routeur;
