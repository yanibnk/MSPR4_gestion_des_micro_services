const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Produit = require('../models/Produit');

const SECRET_KEY = process.env.SECRET_KEY || 'secret'; // Même clé que dans ton middleware

// Création d’un faux admin pour la route DELETE
const idAdmin = new mongoose.Types.ObjectId();
const tokenAdmin = jwt.sign({ id: idAdmin, type: 'admin' }, SECRET_KEY, { expiresIn: '1h' });

let produitExistantId;

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/produits-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await Produit.deleteMany({});

  const produit = new Produit({
    nom: 'Produit Test',
    description: 'Description de test',
    prix: 99.99,
    enStock: true
  });
  await produit.save();
  produitExistantId = produit._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🛍️ API Produits', () => {
  test('GET /produits - récupère tous les produits', async () => {
    const res = await request(app).get('/produits');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /produits/:id - récupère un produit existant', async () => {
    const res = await request(app).get(`/produits/${produitExistantId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(produitExistantId);
    expect(res.body.nom).toBe('Produit Test');
  });

  test('POST /produits - création valide', async () => {
    const res = await request(app)
      .post('/produits')
      .send({
        nom: 'Produit Créé',
        prix: 50,
        description: 'Un nouveau produit'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nom).toBe('Produit Créé');
    expect(res.body.enStock).toBe(true); // valeur par défaut
  });

  test('PUT /produits/:id - mise à jour du produit', async () => {
    const res = await request(app)
      .put(`/produits/${produitExistantId}`)
      .send({
        nom: 'Produit Modifié',
        prix: 77.77
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.nom).toBe('Produit Modifié');
    expect(res.body.prix).toBe(77.77);
  });

  test('DELETE /produits/:id - suppression par admin', async () => {
    const produitASupprimer = new Produit({
      nom: 'À supprimer',
      prix: 10
    });
    await produitASupprimer.save();

    const res = await request(app)
      .delete(`/produits/${produitASupprimer._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/supprimé/i);
  });

  test('DELETE /produits/:id - interdit sans token admin', async () => {
    const produit = new Produit({
      nom: 'Non autorisé',
      prix: 20
    });
    await produit.save();

    const res = await request(app).delete(`/produits/${produit._id}`);

    expect(res.statusCode).toBe(401); // ou 403 selon isAdmin
  });

  test('POST /produits - création invalide (prix manquant)', async () => {
    const res = await request(app)
      .post('/produits')
      .send({
        nom: 'Produit Invalide'
        // pas de prix
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.erreurs).toBeDefined();
  });
});
