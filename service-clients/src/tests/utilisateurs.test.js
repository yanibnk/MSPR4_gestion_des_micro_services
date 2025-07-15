const request = require('supertest');
const mongoose = require('mongoose');
const { app, fermerRabbitMQ } = require('../serveur'); // importer app et fermerRabbitMQ
const Utilisateur = require('../models/utilisateur');

let tokenAdmin = '';
let tokenClient = '';
let idClient = '';
let idAdmin = '';

beforeAll(async () => {
  // Connexion DB (si non déjà faite dans `serveur.js`)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb');
  }

  // Nettoyage DB
  await Utilisateur.deleteMany({});

  // Création utilisateur admin
  const admin = new Utilisateur({
    nom: 'Admin Test',
    email: 'admin@test.com',
    motdepasse: await require('bcryptjs').hash('admin123', 10),
    type: 'admin'
  });
  await admin.save();
  idAdmin = admin._id.toString();

  // Création utilisateur client
  const client = new Utilisateur({
    nom: 'Client Test',
    email: 'client@test.com',
    motdepasse: await require('bcryptjs').hash('client123', 10),
    type: 'client'
  });
  await client.save();
  idClient = client._id.toString();

  // Récupérer les tokens
  const resAdmin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', motdepasse: 'admin123' });
  tokenAdmin = resAdmin.body.token;

  const resClient = await request(app)
    .post('/auth/login')
    .send({ email: 'client@test.com', motdepasse: 'client123' });
  tokenClient = resClient.body.token;
});

afterAll(async () => {
  await fermerRabbitMQ();  // fermer proprement RabbitMQ après les tests
  await mongoose.disconnect();
});

describe('🔍 GET /utilisateurs', () => {
  test('Devrait retourner tous les utilisateurs', async () => {
    const res = await request(app).get('/utilisateurs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('📥 POST /utilisateurs', () => {
  test('Création valide', async () => {
    const res = await request(app)
      .post('/utilisateurs')
      .send({
        nom: 'Nouveau User',
        email: 'nouveau@test.com',
        motdepasse: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('nouveau@test.com');
  });

  test('Échec si email invalide', async () => {
    const res = await request(app)
      .post('/utilisateurs')
      .send({
        nom: 'Test',
        email: 'pasunemail',
        motdepasse: '123456'
      });
    expect(res.statusCode).toBe(400);
  });
});

describe('🔐 GET /utilisateurs/me', () => {
  test('Retourne les infos du client connecté', async () => {
    const res = await request(app)
      .get('/utilisateurs/me')
      .set('Authorization', `Bearer ${tokenClient}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('client@test.com');
    expect(res.body.motdepasse).toBeUndefined(); // champ masqué
  });
});

describe('✏️ PUT /utilisateurs/:id', () => {
  test('Met à jour un utilisateur existant', async () => {
    const res = await request(app)
      .put(`/utilisateurs/${idClient}`)
      .send({ nom: 'Client MisAJour' });
    expect(res.statusCode).toBe(200);
    expect(res.body.nom).toBe('Client MisAJour');
  });
});

describe('🗑 DELETE /utilisateurs/:id', () => {
  test('Supprime un utilisateur (admin seulement)', async () => {
    const userToDelete = new Utilisateur({
      nom: 'À Supprimer',
      email: 'asupprimer@test.com',
      motdepasse: await require('bcryptjs').hash('123456', 10)
    });
    await userToDelete.save();

    const res = await request(app)
      .delete(`/utilisateurs/${userToDelete._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Utilisateur supprimé');
  });

  test('Refus si non admin', async () => {
    const res = await request(app)
      .delete(`/utilisateurs/${idAdmin}`)
      .set('Authorization', `Bearer ${tokenClient}`);
    expect(res.statusCode).toBe(403);
  });
});
