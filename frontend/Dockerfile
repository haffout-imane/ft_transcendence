# --------- Stage 1: Build ---------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# --------- Stage 2: Serve ---------
FROM node:18-slim

WORKDIR /app

COPY package*.json ./          
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3003

CMD ["node", "dist/server.js"]
