# ====== STAGE 1: Build Stage ======
FROM node AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install Prisma CLI for client generation only
RUN npm install prisma --save-dev

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate


# ====== STAGE 2: Runtime Stage ======
FROM node

WORKDIR /app

# Copy built app and generated client from builder
COPY --from=builder /app /app

# Remove dev dependencies to slim image
RUN npm prune --production

EXPOSE 3002

CMD ["node", "server.js"]
