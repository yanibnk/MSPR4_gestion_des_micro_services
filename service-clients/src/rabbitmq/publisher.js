const amqp = require('amqplib');

let connection;  // <- ajouter la connection ici
let channel;
const rabbitUrl = process.env.AMQP_URL || 'amqp://admin:admin@rabbitmq:5672';

const connecterRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitUrl); // garder la connection en global
    channel = await connection.createChannel();
    await channel.assertQueue('clients');
    console.log('✅ Connecté à RabbitMQ (publisher)');
  } catch (error) {
    console.error('❌ Erreur connexion RabbitMQ :', error.message);
    // ⏳ Réessayer après 3 secondes
    setTimeout(connecterRabbitMQ, 3000);
  }
};

const publierSuppressionClient = async (clientId) => {
  if (!channel) {
    console.warn('⚠️ RabbitMQ pas encore prêt');
    return;
  }
  const message = { type: 'CLIENT_SUPPRIME', clientId };
  channel.sendToQueue('clients', Buffer.from(JSON.stringify(message)));
  console.log(`📤 Message envoyé à RabbitMQ :`, message);
};

// Nouvelle fonction pour fermer la connexion RabbitMQ proprement
const fermerRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('✅ Connexion RabbitMQ fermée');
  } catch (err) {
    console.error('❌ Erreur lors de la fermeture RabbitMQ :', err.message);
  }
};

module.exports = {
  connecterRabbitMQ,
  publierSuppressionClient,
  fermerRabbitMQ  // exporter la fonction de fermeture
};
