require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie !'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Routes
const produitsRoutes = require('./routes/produits');    
app.use('/produits', produitsRoutes);

app.get('/', (req, res) => {
  res.send('API Produit opérationnelle ✔️');
});

// Connexion RabbitMQ
const { connecterRabbitMQ } = require('./rabbitmq/publisher');
connecterRabbitMQ();

// Exporte app pour les tests
module.exports = app;

// ✅ Lancement du serveur SEULEMENT si le fichier est exécuté directement
const PORT = process.env.PORT || 3003;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Produit lancé sur http://localhost:${PORT}`);
  });
}
