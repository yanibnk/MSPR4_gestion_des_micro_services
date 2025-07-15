const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch((err) => console.error('❌ Erreur de connexion MongoDB :', err));

// Import des routes
const commandesRoutes = require('./routes/commandes');
app.use('/commandes', commandesRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API Commande 🛒');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
const startConsumer = require('./utils/rabbitmq');
startConsumer(); // Lance le listener RabbitMQ
const startConsumerProduit = require('./utils/rabbitmqproduit');
startConsumerProduit(); // Lance le listener RabbitMQ
module.exports = app;
// Exporter l'app pour les tests
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur API Commande lancé sur le port ${PORT}`);
  });
}
