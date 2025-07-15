const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.ajouterProduit);
router.get('/', productController.getProduits);
router.put('/:id', productController.updateProduit);
router.delete('/:id', productController.deleteProduit);

module.exports = router;
