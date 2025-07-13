# ====== STAGE 1: Build Stage ======
FROM node AS builder

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci

# Install Prisma CLI only for generation
RUN npm install prisma --save-dev

# Copy source files
COPY . .

# Generate Prisma client (no migrations in game service)
RUN npx prisma generate


# ====== STAGE 2: Runtime Stage ======
FROM node

WORKDIR /app

# Copy only what’s needed from build stage
COPY --from=builder /app /app

# Avoid installing dev dependencies again
RUN npm prune --production

EXPOSE 3001

CMD ["node", "server.js"]
