const amqp = require('amqplib');

let channel;

const rabbitUrl = process.env.AMQP_URL || 'amqp://admin:admin@rabbitmq:5672';

const connecterRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    await channel.assertQueue('produits');
    console.log('✅ [Produits] Connecté à RabbitMQ (publisher)');
  } catch (error) {
    console.error('❌ Erreur connexion RabbitMQ :', error.message);
    setTimeout(connecterRabbitMQ, 3000);
  }
};

const publierSuppressionProduit = async (produitId) => {
  if (!channel) {
    console.warn('⚠️ RabbitMQ pas encore prêt');
    return;
  }
  const message = { type: 'PRODUIT_SUPPRIME', produitId };
  channel.sendToQueue('produits', Buffer.from(JSON.stringify(message)));
  console.log(`📤 [Produits] Message envoyé à RabbitMQ :`, message);
};

module.exports = {
  connecterRabbitMQ,
  publierSuppressionProduit
};
