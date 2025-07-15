const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prix: { type: Number, required: true },
  description: String,
  enStock: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', productSchema);
