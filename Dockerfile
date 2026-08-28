# ==============================================================================
# HireHub — Single Hugging Face Space Unified Multi-Tier Docker Architecture
# Production-Grade Multi-Stage Container Image
# Tiers: Frontend (React/Vite) + Backend (Express/Socket.IO) + AI (FastAPI/PyTorch)
#        + MongoDB + Redis + Nginx Reverse Proxy + Supervisord
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React/Vite Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Install Backend Node Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-deps
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev

# ------------------------------------------------------------------------------
# Stage 3: Unified Production Runtime Image
# ------------------------------------------------------------------------------
FROM ubuntu:24.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    NODE_ENV=production \
    PORT=7860 \
    HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface

# Install system packages, Redis, Nginx, Supervisor, Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    software-properties-common \
    git \
    build-essential \
    nginx \
    redis-server \
    supervisor \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install MongoDB 7.0 Community Server
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor && \
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends mongodb-org-server && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup Isolated Python Virtual Environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install CPU-only PyTorch first
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install AI Service dependencies
COPY ai-service/requirements.txt /app/ai-service/
RUN pip install --no-cache-dir -r /app/ai-service/requirements.txt

# Copy AI Microservice source code
COPY ai-service/ /app/ai-service/

# Copy Backend production dependencies and source
COPY --from=backend-deps /app/Backend/node_modules /app/Backend/node_modules
COPY Backend/ /app/Backend/

# Copy Frontend production compiled build
COPY --from=frontend-builder /app/Frontend/dist /app/Frontend/dist

# Copy Deployment configurations
COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY deployment/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deployment/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create runtime directories
RUN mkdir -p /data/db /data/redis /var/log/supervisor /var/run \
    /app/Backend/uploads/cvs /app/Backend/uploads/avatars \
    /app/.cache/huggingface

# Expose single unified public port for Hugging Face Space
EXPOSE 7860

# Health check verifying unified reverse proxy and backend
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-7860}/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
