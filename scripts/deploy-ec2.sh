#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"
APP_NAME="${APP_NAME:-lumi-ride-dev}"
APP_PORT="${APP_PORT:-3000}"
APP_DIR="${APP_DIR:-/var/www/lumi-ride-dev}"

echo "Deploying branch '${BRANCH}' in ${APP_DIR}"
cd "${APP_DIR}"

if [ -d ".git" ]; then
  git fetch origin
  git checkout "${BRANCH}"
  git reset --hard "origin/${BRANCH}"
else
  echo "No git repo in ${APP_DIR}; using synced files."
fi

# Free space on small EC2 instances before install
free_kb="$(df -Pk . | awk 'NR==2 {print $4}')"
min_free_kb=$((2048 * 1024))
echo "Free disk before install: ${free_kb} KB"

rm -rf node_modules .next 2>/dev/null || true
npm cache clean --force 2>/dev/null || true
rm -rf ~/.npm/_cacache ~/.cache 2>/dev/null || true
pm2 flush >/dev/null 2>&1 || true
rm -f ~/.pm2/logs/*.log 2>/dev/null || true

if [ "${free_kb}" -lt "${min_free_kb}" ]; then
  echo "Low disk detected; running extra cleanup."
  sudo journalctl --vacuum-time=2d >/dev/null 2>&1 || true
  sudo apt-get clean >/dev/null 2>&1 || true
  sudo rm -rf /var/lib/apt/lists/* >/dev/null 2>&1 || true
  if command -v docker >/dev/null 2>&1; then
    sudo docker system prune -af >/dev/null 2>&1 || true
  fi
fi

df -h

# Support monorepo (root has lumi-ride + backend) or single frontend repo
if [ -d "lumi-ride" ]; then
  npm ci
  npm run build
  FRONTEND_DIR="lumi-ride"
else
  npm ci
  npm run build
  FRONTEND_DIR="."
fi

cd "${APP_DIR}/${FRONTEND_DIR}"
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start npm --name "${APP_NAME}" -- start -- -p "${APP_PORT}"
fi

pm2 save
echo "Frontend deployment finished for ${APP_NAME}"
