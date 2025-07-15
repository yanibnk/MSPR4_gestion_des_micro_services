const amqp = require('amqplib');
const Commande = require('../models/Commande');

let channel;

const connecterRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('clients');
    console.log('✅ Connecté à RabbitMQ (consumer)');

    // Écoute la file
    channel.consume('clients', async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log("📥 Message reçu :", data);

          if (data.type === 'CLIENT_SUPPRIME' && data.clientId) {
            const result = await Commande.deleteMany({ clientId: data.clientId });
            console.log(`🗑️ Commandes supprimées : ${result.deletedCount}`);
          }

          channel.ack(msg);
        } catch (err) {
          console.error("❌ Erreur traitement message :", err.message);
          channel.nack(msg); // Ne pas confirmer si erreur
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur RabbitMQ (consumer) :', error.message);
    setTimeout(connecterRabbitMQ, 3000); // 🔁 Réessaie après 3 sec
  }
};

module.exports = connecterRabbitMQ;
