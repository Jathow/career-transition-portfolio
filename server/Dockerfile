# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies with Railway-compatible cache handling
RUN npm ci --cache /tmp/.npm --prefer-offline --no-audit --no-optional && \
    npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies with Railway-compatible cache handling
RUN npm ci --cache /tmp/.npm --prefer-offline --no-audit --no-optional && \
    npm cache clean --force

# Copy source files and Prisma files from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/healthcheck.js ./

# Copy entrypoint script
COPY docker-entrypoint.sh ./

# Make scripts executable
RUN chmod +x scripts/*.sh docker-entrypoint.sh

# Create logs and prisma directories with proper permissions
RUN mkdir -p logs prisma && \
    chown -R nodejs:nodejs logs prisma && \
    chmod -R 755 prisma

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"] 