const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  prix: {
    type: Number,
    required: true
  },
  enStock: {
    type: Boolean,
    default: true

  }
}, {
  timestamps: true // ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Produit', produitSchema);
