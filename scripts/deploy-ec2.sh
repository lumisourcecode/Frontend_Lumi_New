#!/usr/bin/env bash
set -euo pipefail

# Avoid CI/deploy failures when unattended-upgrades or another apt holds the lock (EC2).
APT_WAIT=( -o "Acquire::Lock::Timeout=180" -o "DPkg::Lock::Timeout=180" )

wait_for_apt_lock() {
  local i=0
  while sudo fuser /var/lib/apt/lists/lock >/dev/null 2>&1 \
    || sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 \
    || sudo fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "${i}" -gt 60 ]; then
      echo "ERROR: apt/dpkg lock still held after ~300s" >&2
      return 1
    fi
    echo "Waiting for apt lock to clear (${i}/60)..."
    sleep 5
  done
}

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
        proxy_connect_timeout 15s;
        proxy_send_timeout 180s;
        proxy_read_timeout 180s;
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
        proxy_connect_timeout 15s;
        proxy_send_timeout 180s;
        proxy_read_timeout 180s;
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
    sudo systemctl enable nginx >/dev/null 2>&1 || true
    sudo systemctl start nginx >/dev/null 2>&1 || true
    sudo systemctl reload nginx
    echo "Nginx updated: /_next/static -> ${STATIC_ABS}/"
  else
    echo "WARNING: nginx -t failed; not reloading." >&2
  fi
}

lumi_setup_https() {
  local DOMAIN="${LUMI_DOMAIN:-new.lumiride.com}"
  local CERT_EMAIL="${LUMI_CERTBOT_EMAIL:-admin@lumiride.com}"
  if ! command -v nginx >/dev/null 2>&1; then
    wait_for_apt_lock || true
    sudo apt-get "${APT_WAIT[@]}" update -qq >/dev/null 2>&1 || true
    sudo apt-get "${APT_WAIT[@]}" install -y nginx >/dev/null 2>&1 || true
  fi
  if ! command -v certbot >/dev/null 2>&1; then
    wait_for_apt_lock || true
    sudo apt-get "${APT_WAIT[@]}" update -qq >/dev/null 2>&1 || true
    sudo apt-get "${APT_WAIT[@]}" install -y certbot python3-certbot-nginx >/dev/null 2>&1 || true
  fi
  if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${CERT_EMAIL}" --redirect || true
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

# Monorepo (lumi-ride/) vs single frontend repo (Next at root)
if [ -d "lumi-ride" ]; then
  FRONTEND_DIR="lumi-ride"
else
  FRONTEND_DIR="."
fi

# Next.js inlines NEXT_PUBLIC_* at build time. Writing .env.production before `npm run build`
# matches `export` from GitHub Actions and gives a visible file on the server for debugging.
lumi_write_frontend_env() {
  local dir="${1:?}"
  local f="${APP_DIR}/${dir}/.env.production"
  local tmp
  local old_umask
  tmp="$(mktemp)"
  old_umask="$(umask)"
  umask 077
  [ -n "${NEXT_PUBLIC_API_BASE_URL:-}" ] && printf '%s=%s\n' "NEXT_PUBLIC_API_BASE_URL" "${NEXT_PUBLIC_API_BASE_URL}" >> "${tmp}"
  [ -n "${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-}" ] && printf '%s=%s\n' "NEXT_PUBLIC_GOOGLE_CLIENT_ID" "${NEXT_PUBLIC_GOOGLE_CLIENT_ID}" >> "${tmp}"
  [ -n "${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:-}" ] && printf '%s=%s\n' "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}" >> "${tmp}"
  [ -n "${NEXT_PUBLIC_SKIP_AUTH:-}" ] && printf '%s=%s\n' "NEXT_PUBLIC_SKIP_AUTH" "${NEXT_PUBLIC_SKIP_AUTH}" >> "${tmp}"
  if [ -s "${tmp}" ]; then
    mv "${tmp}" "${f}"
    chmod 600 "${f}"
    echo "Wrote ${f} for next build (NEXT_PUBLIC_* from environment)."
  else
    rm -f "${tmp}"
    rm -f "${f}"
    echo "No NEXT_PUBLIC_* in environment; removed ${f} if present (Next.js will use code defaults)."
  fi
  umask "${old_umask}"
}

lumi_write_frontend_env "${FRONTEND_DIR}"

# Free space on small EC2 instances before install
free_kb="$(df -Pk . | awk 'NR==2 {print $4}')"
min_free_kb=$((2048 * 1024))
echo "Free disk before install: ${free_kb} KB"

# Full deploy mode (default): remove modules and install fresh for reproducible releases.
echo "Full deploy mode: cleaning node_modules before install."
rm -rf node_modules lumi-ride/node_modules 2>/dev/null || true
npm cache clean --force 2>/dev/null || true
rm -rf ~/.npm/_cacache ~/.cache 2>/dev/null || true

# Build output can be regenerated safely each deploy.
rm -rf .next lumi-ride/.next 2>/dev/null || true
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

# Even after cleanup, fresh installs are unreliable below ~1.5GB free on this project.
post_cleanup_free_kb="$(df -Pk . | awk 'NR==2 {print $4}')"
min_required_kb=$((1536 * 1024))
if [ "${post_cleanup_free_kb}" -lt "${min_required_kb}" ]; then
  echo "ERROR: only ${post_cleanup_free_kb} KB free after cleanup; need at least ${min_required_kb} KB." >&2
  echo "Resize EC2 root volume (EBS) and grow filesystem, then re-run deploy." >&2
  exit 78
fi

# Install deps in full mode to avoid lockfile drift failures in production deploy.
npm_install_or_ci() {
  local NPM_CACHE_DIR="${APP_DIR}/.npm-cache"
  mkdir -p "${NPM_CACHE_DIR}"
  # Use app-local cache to avoid intermittent ~/.npm/_cacache corruption/rename issues on EC2.
  if ! npm install --no-audit --no-fund --cache "${NPM_CACHE_DIR}" --prefer-online; then
    echo "npm install failed; clearing local npm cache and retrying once..."
    rm -rf "${NPM_CACHE_DIR}" 2>/dev/null || true
    mkdir -p "${NPM_CACHE_DIR}"
    npm cache clean --force >/dev/null 2>&1 || true
    npm install --no-audit --no-fund --cache "${NPM_CACHE_DIR}" --prefer-online
  fi
}

# Support monorepo (root has lumi-ride + backend) or single frontend repo
if [ -d "lumi-ride" ]; then
  npm_install_or_ci
  npm run build
else
  npm_install_or_ci
  npm run build
fi

# Ensure nginx can read Next.js static files even if restrictive umask was inherited.
if [ -d "${APP_DIR}/${FRONTEND_DIR}/.next" ]; then
  chmod -R a+rX "${APP_DIR}/${FRONTEND_DIR}/.next" || true
fi

cd "${APP_DIR}/${FRONTEND_DIR}"
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start npm --name "${APP_NAME}" -- start -- -p "${APP_PORT}"
fi

pm2 save

# Verify Next.js process is reachable locally before reporting success.
if ! command -v curl >/dev/null 2>&1; then
  wait_for_apt_lock || true
  sudo apt-get "${APT_WAIT[@]}" update -qq >/dev/null 2>&1 || true
  sudo apt-get "${APT_WAIT[@]}" install -y curl >/dev/null 2>&1 || true
fi
ready=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:${APP_PORT}/" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [ "${ready}" -ne 1 ]; then
  echo "ERROR: Next.js app is not responding on http://127.0.0.1:${APP_PORT}" >&2
  pm2 status || true
  exit 79
fi

echo "Frontend deployment finished for ${APP_NAME}"

# Serve Next.js static assets from nginx (not via Node). If /_next/static/* is proxied only to
# next start, some EC2 setups return 500 for chunk files → browser stuck on "Loading…" and login never works.
lumi_update_nginx "${FRONTEND_DIR}"
lumi_setup_https
lumi_update_nginx "${FRONTEND_DIR}"
sudo nginx -t && sudo systemctl reload nginx
if command -v ss >/dev/null 2>&1; then
  sudo ss -ltnp | rg ':80|:443' || true
fi
