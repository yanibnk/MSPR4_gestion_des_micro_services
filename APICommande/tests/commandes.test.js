const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Commande = require('../models/Commande');

const SECRET_KEY = process.env.SECRET_KEY || 'secret'; // la même que dans ton middleware

// 🧪 Création de clients fictifs
const idClient = new mongoose.Types.ObjectId();
const idAdmin = new mongoose.Types.ObjectId();

const tokenClient = jwt.sign(
  { id: idClient, type: 'client' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

const tokenAdmin = jwt.sign(
  { id: idAdmin, type: 'admin' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

let commandeIdClient;

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commandes-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await Commande.deleteMany({});

  const commande = new Commande({
    IdCommande: 'CMD123',
    PrixTotal: 100,
    NombreProduit: 2,
    AdresseDeLivraison: '123 Rue Test',
    IdUtilisateur: idClient,
    IdProduit: new mongoose.Types.ObjectId()
  });
  await commande.save();
  commandeIdClient = commande._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🛒 Commandes API', () => {
  test('GET /commandes - admin récupère toutes les commandes', async () => {
    const res = await request(app)
      .get('/commandes')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /commandes - création valide par client', async () => {
    const res = await request(app)
      .post('/commandes')
      .set('Authorization', `Bearer ${tokenClient}`)
      .send({
        IdCommande: 'CMD456',
        PrixTotal: 50,
        NombreProduit: 1,
        AdresseDeLivraison: '456 Rue Exemple',
        IdProduit: new mongoose.Types.ObjectId().toString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.PrixTotal).toBe(50);
    expect(res.body.IdUtilisateur).toBe(idClient.toString());
  });

  test('GET /commandes/:id - client récupère sa commande', async () => {
    const res = await request(app)
      .get(`/commandes/${commandeIdClient}`)
      .set('Authorization', `Bearer ${tokenClient}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(commandeIdClient);
  });

  test('PUT /commandes/:id - mise à jour par client', async () => {
    const res = await request(app)
      .put(`/commandes/${commandeIdClient}`)
      .set('Authorization', `Bearer ${tokenClient}`)
      .send({ AdresseDeLivraison: 'Nouvelle adresse' });

    expect(res.statusCode).toBe(200);
    expect(res.body.AdresseDeLivraison).toBe('Nouvelle adresse');
  });

  test('DELETE /commandes/:id - suppression par admin', async () => {
    const commandeASupprimer = new Commande({
      IdCommande: 'CMDDEL',
      PrixTotal: 20,
      NombreProduit: 1,
      AdresseDeLivraison: 'Adresse Supp',
      IdUtilisateur: idClient,
      IdProduit: new mongoose.Types.ObjectId()
    });
    await commandeASupprimer.save();

    const res = await request(app)
      .delete(`/commandes/${commandeASupprimer._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/supprimée/i);
  });
});
