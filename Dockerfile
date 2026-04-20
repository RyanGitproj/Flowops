# ─── Builder stage ─────────────────────────────────────────────
FROM node:24 AS builder

WORKDIR /app

# Copy package files first for better cache utilization
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# ─── Production stage ──────────────────────────────────────────
FROM node:24 AS production

WORKDIR /app

# Install netcat for PostgreSQL connection check in entrypoint
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nestjs

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built artifacts and Prisma client from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY docker/entrypoint.sh /docker/entrypoint.sh
RUN chmod +x /docker/entrypoint.sh

# Switch to non-root user
USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["sh", "/docker/entrypoint.sh"]
