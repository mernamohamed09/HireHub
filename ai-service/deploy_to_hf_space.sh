#!/usr/bin/env bash
# ==============================================================================
# HireHub AI Service -> Hugging Face Space Deployment Script
# ==============================================================================
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <HUGGINGFACE_SPACE_GIT_URL>"
  echo "Example: $0 https://huggingface.co/spaces/username/hirehub-ai-service"
  exit 1
fi

SPACE_URL="$1"
TEMP_DIR=$(mktemp -d)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Deploying HireHub AI microservice to Hugging Face Space: ${SPACE_URL}"
echo "==> Staging deployment files into temporary directory: ${TEMP_DIR}"

# Clone or initialize Hugging Face space repository
git clone "${SPACE_URL}" "${TEMP_DIR}/space" || {
  mkdir -p "${TEMP_DIR}/space"
  cd "${TEMP_DIR}/space"
  git init -b main
  git remote add origin "${SPACE_URL}"
}

cd "${TEMP_DIR}/space"

# Copy all AI service files (excluding virtual environments and caches)
rsync -av --exclude='.venv' --exclude='__pycache__' --exclude='.env' --exclude='data/cache' "${SCRIPT_DIR}/" "${TEMP_DIR}/space/"

git add .
if git diff --cached --quiet; then
  echo "==> No changes detected. Hugging Face Space is already up to date."
else
  git commit -m "deploy: update HireHub AI ATS scoring microservice"
  echo "==> Pushing deployment to Hugging Face Space..."
  git push origin main
  echo "==> Deployment successfully pushed to Hugging Face Space!"
fi

rm -rf "${TEMP_DIR}"
echo "==> Done!"
