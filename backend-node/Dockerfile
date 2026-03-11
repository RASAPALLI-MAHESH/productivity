FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies (production only)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source
COPY src ./src
COPY server.js ./

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# Health check — waits 20s for Firebase to init before first check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

CMD ["node", "server.js"]
