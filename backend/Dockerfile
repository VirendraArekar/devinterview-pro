# Multi-stage Dockerfile for NestJS Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Install native build tools for any C/C++ addons
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install

COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/
RUN npm run build

# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy compiled artifacts and modules directly from builder
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create unprivileged application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /app/data && chown -R appuser:appgroup /app
USER appuser

EXPOSE 4000

CMD ["node", "dist/main"]
