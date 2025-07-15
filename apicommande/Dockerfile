# Utilise une image officielle Node.js
FROM node:18

# Crée un répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json (si présent)
COPY package*.json ./

RUN apt-get update && apt-get install -y netcat-openbsd


# Installe les dépendances
RUN npm install

# Copie tout le code de ton projet
COPY . .

# Indique à Docker le port utilisé par ton app
EXPOSE 3000
# Installe les dépendances de développement
RUN npm install --only=dev
COPY wait-for-rabbitmq.sh /wait-for-rabbitmq.sh
RUN chmod +x /wait-for-rabbitmq.sh
ENTRYPOINT ["/wait-for-rabbitmq.sh"]

# Commande pour démarrer ton serveur
CMD ["node", "app.js"]

