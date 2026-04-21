# -----------------------------
# MotoMart IMS - Frontend Dockerfile
# File: Dockerfile
# Version: 1.0.0
# Purpose: Dev-friendly container for Vite (local).
# -----------------------------

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
