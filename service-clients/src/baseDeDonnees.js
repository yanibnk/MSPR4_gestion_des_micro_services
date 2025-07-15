const mongoose = require('mongoose');
const logger = require('./utils/logger');

const connecterBD = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("✅ Connexion MongoDB réussie");
  } catch (err) {
    logger.error("❌ Échec connexion MongoDB : " + err.message);
    process.exit(1);
  }
};

module.exports = connecterBD;
