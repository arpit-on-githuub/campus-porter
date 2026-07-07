# SLING backend — deterministic image for Koyeb / any container host.
FROM node:20-alpine

WORKDIR /app

# Install production deps only (uses package-lock.json for reproducible builds).
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

ENV NODE_ENV=production

# The app reads process.env.PORT (Koyeb injects it); 3000 is the local default.
EXPOSE 3000

CMD ["node", "server.js"]
