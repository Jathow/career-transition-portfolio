# Multi-stage build for minimal production image
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Dependencies stage
FROM base AS deps
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# Install all dependencies
RUN npm ci --include=dev --prefer-offline --no-audit
RUN cd client && npm ci --include=dev --prefer-offline --no-audit
RUN cd server && npm ci --include=dev --prefer-offline --no-audit

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build applications
RUN cd client && DISABLE_ESLINT_PLUGIN=true npm run build
RUN cd server && npm run build

# Production stage - minimal image
FROM node:18-alpine AS production
WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# Install only production dependencies
RUN npm ci --omit=dev --prefer-offline --no-audit
RUN cd server && npm ci --omit=dev --prefer-offline --no-audit

# Copy built applications
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma

# Copy runtime files
COPY server/railway-start.js ./server/
COPY server/create-admin-railway.js ./server/
COPY server/healthcheck.js ./server/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/healthcheck.js

# Start command
CMD ["npm", "run", "railway:start"]