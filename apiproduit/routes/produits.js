const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');
const { publierSuppressionProduit } = require('../rabbitmq/publisher');
const { body, validationResult } = require('express-validator');
const isAdmin = require('../middlewares/auth');

// ✅ GET tous les produits
router.get('/', async (req, res) => {
  try {
    const produits = await Produit.find();
    res.json(produits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST créer un produit (avec validations)
router.post('/',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prix').isNumeric().withMessage('Le prix doit être un nombre'),
    body('enStock').optional().isBoolean().withMessage('Le champ enStock doit être un booléen')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    const produit = new Produit(req.body);
    try {
      const nouveauProduit = await produit.save();
      res.status(201).json(nouveauProduit);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ✅ PUT modifier un produit (avec validations)
router.put('/:id',
  [
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('prix').optional().isNumeric().withMessage('Le prix doit être un nombre'),
    body('enStock').optional().isBoolean().withMessage('Le champ enStock doit être un booléen')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    try {
      const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
      res.json(produit);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ✅ DELETE supprimer un produit (admin seulement)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const result = await Produit.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Produit non trouvé' });

    await publierSuppressionProduit(req.params.id); // ➜ envoie message RabbitMQ
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
