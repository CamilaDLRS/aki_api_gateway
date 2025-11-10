# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for AKI API Gateway

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Install all deps (dev + prod) for build
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
COPY src/docs ./src/docs
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
# Copy dist and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs ./src/docs
COPY .env.example ./
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://localhost:${PORT}/health || exit 1
# Node base image already provides 'node' user
USER node
CMD ["node", "dist/server.js"]
