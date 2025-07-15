const amqp = require('amqplib');

let channel;
const rabbitUrl = process.env.AMQP_URL || 'amqp://admin:admin@rabbitmq:5672';
const connecterRabbitMQ = async () => {
  try {
     const connection = await amqp.connect(rabbitUrl);
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

module.exports = {
  connecterRabbitMQ,
  publierSuppressionClient
};
