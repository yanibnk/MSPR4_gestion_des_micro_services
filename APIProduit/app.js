require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion MongoDB réussie !'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Import des routes
const produitsRoutes = require('./routes/produits');    
app.use('/produits', produitsRoutes);


app.get('/', (req, res) => {
  res.send('API Produit opérationnelle ✔️');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Produit lancé sur http://localhost:${PORT}`);
});
const { connecterRabbitMQ } = require('./rabbitmq/publisher');
connecterRabbitMQ(); // Connexion RabbitMQ

module.exports = app;
// Exporter l'app pour les tests
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur API Commande lancé sur le port ${PORT}`);
  });
}