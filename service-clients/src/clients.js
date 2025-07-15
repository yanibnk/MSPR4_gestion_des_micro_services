const express = require('express');
const routeur = express.Router();
const Client = require('./models/utilisateur');


// Obtenir tous les clients
routeur.get('/', async (req, res) => {
  try {
    const clients = await client.find();
    res.json(clients);
  } catch (erreur) {
    res.status(500).send("Erreur serveur");
  }
});

// Ajouter un client
routeur.post('/', async (req, res) => {
  try {
    const { nom, email } = req.body;
    const nouveauClient = new Client({ nom, email });
    await nouveauClient.save();
    res.status(201).json(nouveauClient);
  } catch (erreur) {
    console.error("Erreur détaillée :", erreur.message); // 👈 ajoute cette ligne
    res.status(400).send("Erreur lors de la création du client");
  }
});


module.exports = routeur;
