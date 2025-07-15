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

const { connecterRabbitMQ, fermerRabbitMQ } = require('./rabbitmq/publisher');
connecterRabbitMQ(); // Connexion RabbitMQ

const routeUtilisateurs = require('./routes/utilisateurs');
app.use('/utilisateurs', routeUtilisateurs);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ✅ Exporter app et fermerRabbitMQ pour les tests et la fermeture propre
module.exports = { app, fermerRabbitMQ };

// ✅ Lancer le serveur seulement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Serveur utilisateurs lancé sur le port ${PORT}`);
  });

  // Gérer proprement la fermeture du serveur et de RabbitMQ à la fermeture du process
  const shutdown = async () => {
    logger.info('🛑 Fermeture du serveur...');
    server.close(async () => {
      await fermerRabbitMQ();
      logger.info('Serveur fermé');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
