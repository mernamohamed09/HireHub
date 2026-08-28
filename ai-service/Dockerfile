# ==============================================================================
# HireHub AI ATS Microservice - Hugging Face Space & Production Dockerfile
# CPU-Optimized, Non-Root, Production-Grade Container
# ==============================================================================

FROM python:3.12-slim

# Set environment variables for Python and Hugging Face Space
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8008 \
    HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface

# Install system dependencies (curl for healthchecks, build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for Hugging Face Spaces security compliance (UID 1000)
RUN useradd -m -u 1000 user

WORKDIR /app

# Upgrade pip and install CPU-only PyTorch first to minimize image layers
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install remaining dependencies
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directories with correct permissions
RUN mkdir -p /app/.cache/huggingface && \
    chown -R user:user /app

# Copy application source code
COPY --chown=user:user . .

# Switch to non-root user
USER user

# Expose microservice port (default 8008, dynamic on HF Spaces)
EXPOSE 8008

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8008}/health || exit 1

# Start FastAPI application via Uvicorn
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8008"]
