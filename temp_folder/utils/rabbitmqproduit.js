const amqp = require('amqplib');
const Commande = require('../models/Commande');
const rabbitUrl = process.env.AMQP_URL || 'amqp://admin:admin@rabbitmq:5672';
const startProduitConsumer = async () => {
  try {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    const queue = 'produits';

    await channel.assertQueue(queue, { durable: true });
    console.log('✅ [Commandes] En écoute sur la file produits...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        if (data.type === 'PRODUIT_SUPPRIME' && data.produitId) {
          const result = await Commande.deleteMany({ IdProduit: data.produitId });
          console.log(`🗑️ ${result.deletedCount} commande(s) supprimée(s) pour produit ${data.produitId}`);
        }

        channel.ack(msg);
      }
    });

  } catch (err) {
    console.error('❌ Erreur RabbitMQ (produits consumer) :', err.message);
  }
};

module.exports = startProduitConsumer;
