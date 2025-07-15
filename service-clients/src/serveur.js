// src/serveur.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connecterBD = require('./baseDeDonnees');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

connecterBD(); // Connexion MongoDB
const { connecterRabbitMQ } = require('./rabbitmq/publisher');
connecterRabbitMQ(); // Connexion RabbitMQ

const routeUtilisateurs = require('./routes/utilisateurs');
app.use('/utilisateurs', routeUtilisateurs);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ✅ Exporter app pour les tests
module.exports = app;

// ✅ Lancer le serveur seulement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur utilisateurs lancé sur le port ${PORT}`);
  });
}
