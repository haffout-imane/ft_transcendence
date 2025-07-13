# ====== STAGE 1: Build ======
FROM node AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npm install prisma --save-dev

COPY . .

# Generate client
RUN npx prisma generate

# Apply migrations in production-safe way
# RUN npx prisma migrate deploy


# ====== STAGE 2: Runtime ======
FROM node

WORKDIR /app

# Install OpenSSL and any other needed packages
RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app /app

RUN npm prune --production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
