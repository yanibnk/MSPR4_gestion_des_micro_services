const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { body, validationResult } = require('express-validator');

// ✅ GET toutes les commandes (admin = toutes, client = les siennes)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const filtre = req.utilisateur.type === 'admin'
      ? {}
      : { IdUtilisateur: req.utilisateur.id };

    const commandes = await Commande.find(filtre);
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET /me (commandes de l'utilisateur connecté)
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const commandes = await Commande.find({ IdUtilisateur: req.utilisateur.id });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET une commande par ID (seulement si admin ou propriétaire)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    if (
      req.utilisateur.type !== 'admin' &&
      commande.IdUtilisateur.toString() !== req.utilisateur.id
    ) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    res.json(commande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST créer une commande (avec validation)
router.post('/',
  isAuthenticated,
  [
    body('PrixTotal').isNumeric().withMessage('PrixTotal doit être un nombre'),
    body('NombreProduit').isInt({ min: 1 }).withMessage('NombreProduit doit être un entier ≥ 1'),
    body('AdresseDeLivraison').notEmpty().withMessage('Adresse de livraison requise'),
    body('IdProduit').isMongoId().withMessage('IdProduit doit être un ID Mongo valide')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    const commande = new Commande({
      ...req.body,
      IdUtilisateur: req.utilisateur.id
    });

    try {
      const nouvelleCommande = await commande.save();
      res.status(201).json(nouvelleCommande);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ✅ PUT modifier une commande (avec validation)
router.put('/:id',
  isAuthenticated,
  [
    body('PrixTotal').optional().isNumeric().withMessage('PrixTotal doit être un nombre'),
    body('NombreProduit').optional().isInt({ min: 1 }).withMessage('NombreProduit doit être un entier ≥ 1'),
    body('AdresseDeLivraison').optional().notEmpty().withMessage('Adresse requise'),
    body('IdProduit').optional().isMongoId().withMessage('IdProduit doit être un ID Mongo valide')
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }

    try {
      const commande = await Commande.findById(req.params.id);
      if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

      if (
        req.utilisateur.type !== 'admin' &&
        commande.IdUtilisateur.toString() !== req.utilisateur.id
      ) {
        return res.status(403).json({ message: 'Modification non autorisée' });
      }

      const miseAJour = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(miseAJour);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ✅ DELETE supprimer une commande (admin ou propriétaire)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    if (
      req.utilisateur.type !== 'admin' &&
      commande.IdUtilisateur.toString() !== req.utilisateur.id
    ) {
      return res.status(403).json({ message: 'Suppression non autorisée' });
    }

    await Commande.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
