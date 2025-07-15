require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const commandesRoutes = require('./routes/commandes');

const app = express();
app.use(express.json());
app.use('/api/commandes', commandesRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connexion MongoDB réussie');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Serveur lancé sur le port ${port}`));
})
.catch((err) => console.error('❌ Erreur MongoDB :', err));
const startConsumer = require('./utils/rabbitmq');
startConsumer(); // Lance le listener RabbitMQ

