#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"
APP_NAME="${APP_NAME:-lumi-ride-dev}"
APP_PORT="${APP_PORT:-3000}"
APP_DIR="${APP_DIR:-/var/www/lumi-ride-dev}"

# Only refresh nginx (e.g. after first certbot). Set FRONTEND_DIR or we detect from .next/static.
lumi_update_nginx() {
  local FRONTEND_DIR="${1:?}"
  local STATIC_ROOT="${APP_DIR}/${FRONTEND_DIR}/.next/static"
  if ! command -v nginx >/dev/null 2>&1 || [ ! -d "${STATIC_ROOT}" ]; then
    echo "Skipping nginx (nginx missing or no ${STATIC_ROOT})." >&2
    return 0
  fi
  local STATIC_ABS
  STATIC_ABS="$(cd "${APP_DIR}/${FRONTEND_DIR}" && pwd)/.next/static"
  local DOMAIN="${LUMI_DOMAIN:-new.lumiride.com}"
  local LE_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
  local LE_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

  write_nginx_http_only() {
    sudo tee /etc/nginx/sites-available/lumi-ride-dev > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location /_next/static/ {
        alias ${STATIC_ABS}/;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  }

  write_nginx_https() {
    local ssl_extra=""
    [ -f /etc/letsencrypt/options-ssl-nginx.conf ] && ssl_extra="    include /etc/letsencrypt/options-ssl-nginx.conf;"
    local dh_extra=""
    [ -f /etc/letsencrypt/ssl-dhparams.pem ] && dh_extra="    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"

    sudo tee /etc/nginx/sites-available/lumi-ride-dev > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${DOMAIN};
    ssl_certificate ${LE_CERT};
    ssl_certificate_key ${LE_KEY};
${ssl_extra}
${dh_extra}

    location /_next/static/ {
        alias ${STATIC_ABS}/;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  }

  if [ -f "${LE_CERT}" ] && [ -f "${LE_KEY}" ]; then
    write_nginx_https
  else
    write_nginx_http_only
  fi

  sudo ln -sf /etc/nginx/sites-available/lumi-ride-dev /etc/nginx/sites-enabled/lumi-ride-dev
  sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "Nginx updated: /_next/static -> ${STATIC_ABS}/"
  else
    echo "WARNING: nginx -t failed; not reloading." >&2
  fi
}

if [ "${NGINX_ONLY:-0}" = "1" ]; then
  cd "${APP_DIR}"
  if [ -d "lumi-ride/.next/static" ]; then
    lumi_update_nginx "lumi-ride"
  elif [ -d ".next/static" ]; then
    lumi_update_nginx "."
  else
    echo "NGINX_ONLY: no .next/static found under ${APP_DIR}. Run a full deploy first." >&2
    exit 1
  fi
  exit 0
fi

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

rm -rf node_modules .next lumi-ride/node_modules lumi-ride/.next 2>/dev/null || true
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

# Install deps: prefer npm ci (reproducible). If lockfile is out of sync with package.json (e.g. dev
# added a dependency but forgot to commit package-lock.json), fall back to npm install.
npm_install_or_ci() {
  if npm ci; then
    return 0
  fi
  echo "WARNING: npm ci failed (lockfile may be out of sync). Running npm install..." >&2
  npm install
}

# Support monorepo (root has lumi-ride + backend) or single frontend repo
if [ -d "lumi-ride" ]; then
  npm_install_or_ci
  npm run build
  FRONTEND_DIR="lumi-ride"
else
  npm_install_or_ci
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

# Serve Next.js static assets from nginx (not via Node). If /_next/static/* is proxied only to
# next start, some EC2 setups return 500 for chunk files → browser stuck on "Loading…" and login never works.
lumi_update_nginx "${FRONTEND_DIR}"
