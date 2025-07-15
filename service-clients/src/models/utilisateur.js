const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motdepasse: { type: String, required: true },
  type: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  statut: {
    type: String,
    enum: ['actif', 'bloqué'],
    default: 'actif'
  }
}, { timestamps: true });  // <-- ici c'est la bonne syntaxe

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
