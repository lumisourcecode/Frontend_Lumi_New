#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"
APP_NAME="${APP_NAME:-lumi-ride-dev}"
APP_PORT="${APP_PORT:-3000}"
APP_DIR="${APP_DIR:-/var/www/lumi-ride-dev}"

echo "Deploying branch '${BRANCH}' in ${APP_DIR}"
cd "${APP_DIR}"

git fetch origin
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

npm ci
npm run build

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start npm --name "${APP_NAME}" -- start -- -p "${APP_PORT}"
fi

pm2 save
echo "Deployment finished for ${APP_NAME}"
