# =============================================================================
# Listings Service - Fastify
# =============================================================================

FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (cached layer)
RUN npm ci

# =============================================================================
# Builder stage
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code (includes src/shared/zones.json)
COPY tsconfig.json tsup.config.ts ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application and prisma schema
COPY --from=builder /app/dist ./dist/
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3002

CMD ["npm", "run", "start"]
