const mongoose = require('mongoose');

const uri = 'mongodb+srv://ikraamamroun:ztfZ2JePXwdThPKd@cluster0.bgbslmo.mongodb.net/produits?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('Connexion MongoDB réussie !');
  })
  .catch(err => {
    console.error('Erreur de connexion MongoDB :', err);
  });
