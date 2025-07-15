const mongoose = require('mongoose');

const CommandeSchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    produits: [{ nom: String, quantite: Number }],
    statut: { type: String, default: 'en attente' },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Commande', CommandeSchema);
