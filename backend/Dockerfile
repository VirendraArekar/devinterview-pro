# Multi-stage Dockerfile for NestJS Backend
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/
RUN npm run build

# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create unprivileged user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

CMD ["node", "dist/main"]
