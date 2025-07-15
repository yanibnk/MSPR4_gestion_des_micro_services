# Utilise une image officielle Node.js
FROM node:18

# Crée un répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json (si présent)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le code de ton projet
COPY . .

# Indique à Docker le port utilisé par ton app
EXPOSE 5000

# Commande pour démarrer ton serveur
CMD ["node", "index.js"]

