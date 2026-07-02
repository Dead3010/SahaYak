# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend ────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000
COPY backend/ ./
RUN npm run build
# Copy static assets into dist so they're included in the production stage
RUN cp "src/services/knowledge-base (2).md" "dist/services/knowledge-base (2).md"

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app/backend

# Copy package files and Prisma schema before install so prisma generate works
COPY backend/package*.json ./
COPY backend/prisma ./prisma

# Install production deps — prisma CLI is in dependencies, triggers generate via postinstall
RUN npm install --omit=dev --fetch-retries=5 --fetch-retry-mintimeout=20000

# Compiled backend JS (includes knowledge-base md copied in builder stage)
COPY --from=backend-builder /app/backend/dist ./dist

# Built frontend — Express serves these as static files from /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3001
CMD ["npm", "start"]
