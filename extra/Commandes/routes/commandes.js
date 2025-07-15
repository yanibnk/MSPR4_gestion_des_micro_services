const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande');
const { body, validationResult } = require('express-validator');


// Créer une commande avec validation
router.post(
  '/',
  [
    body('clientId').notEmpty().withMessage('Le clientId est requis'),
    body('produits').isArray({ min: 1 }).withMessage('produits doit être un tableau non vide'),
    body('total').isFloat({ min: 0 }).withMessage('total doit être un nombre positif')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    try {
      const commande = new Commande(req.body);
      await commande.save();
      res.status(201).json(commande);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Lire toutes les commandes
router.get('/', async (req, res) => {
    try {
        const commandes = await Commande.find();
        res.json(commandes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lire une commande
router.get('/:id', async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) return res.status(404).json({ error: 'Commande non trouvée' });
        res.json(commande);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier une commande
router.put('/:id', async (req, res) => {
    try {
        const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!commande) return res.status(404).json({ error: 'Commande non trouvée' });
        res.json(commande);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Supprimer une commande
router.delete('/:id', async (req, res) => {
    try {
        const commande = await Commande.findByIdAndDelete(req.params.id);
        if (!commande) return res.status(404).json({ error: 'Commande non trouvée' });
        res.json({ message: 'Commande supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
