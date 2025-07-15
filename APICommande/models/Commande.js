const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  IdCommande: { type: String, required: true, unique: true },
  PrixTotal: { type: Number, required: true },
  NombreProduit: { type: Number, required: true },
  AdresseDeLivraison: { type: String, required: true },
  IdUtilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  IdProduit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Commande', commandeSchema);
