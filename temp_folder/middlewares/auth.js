const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1]; // "Bearer xxx"

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit : admin requis' });
    }

    req.utilisateur = decoded; // pour accéder dans la suite
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = isAdmin;
