# =============================================================================
# Multi-stage build: Build frontend + Serve with Nginx (HTTPS)
# =============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (cached layer)
RUN npm ci

# Stage 2: Build the frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/package*.json ./

# Copy source code
COPY frontend/ ./
COPY shared/ ../shared/
COPY .env .env

# Build for production
RUN npm run build

# Stage 3: Serve with Nginx
FROM nginx:1.25-alpine

# Copy nginx configuration
COPY nginx/conf.d/ /etc/nginx/conf.d/

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
