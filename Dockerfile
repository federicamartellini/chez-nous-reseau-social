# Dockerfile pour Chez Nous
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY Backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY Backend/src ./src

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["npm", "start"]
