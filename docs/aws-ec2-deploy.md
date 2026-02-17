# AWS EC2 Deploy Guide (Dev + Main)

This project ships with GitHub Actions workflows for:

- `dev` branch auto deploy -> EC2
- `main` branch manual deploy (approval-ready)

## 1) Create `dev` branch

Already created locally:

```bash
git checkout -b dev
```

Push once your GitHub remote is configured:

```bash
git push -u origin dev
```

## 2) EC2 server bootstrap

Run these commands on `13.239.237.63` (Ubuntu):

```bash
sudo apt update && sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

Create app folders:

```bash
sudo mkdir -p /var/www/lumi-ride-dev /var/www/lumi-ride-main
sudo chown -R $USER:$USER /var/www/lumi-ride-dev /var/www/lumi-ride-main
```

Clone repo twice (same repo, separate branches/deploy dirs):

```bash
git clone <YOUR_GITHUB_REPO_URL> /var/www/lumi-ride-dev
git clone <YOUR_GITHUB_REPO_URL> /var/www/lumi-ride-main
```

```bash
cd /var/www/lumi-ride-dev && git checkout dev
cd /var/www/lumi-ride-main && git checkout main
```

## 3) GitHub repository secrets

Set these in **GitHub -> Settings -> Secrets and variables -> Actions**:

- `EC2_HOST` = `13.239.237.63`
- `EC2_USER` = `ubuntu` (or your EC2 ssh user)
- `EC2_SSH_KEY` = private key content for that EC2 user
- `EC2_APP_DIR` = `/var/www/lumi-ride-dev`
- `EC2_APP_DIR_MAIN` = `/var/www/lumi-ride-main`

## 4) Workflows

- `.github/workflows/deploy-dev.yml`
  - Triggers on push to `dev`
  - Runs lint/build in CI
  - SSH deploys to EC2, branch `dev`, PM2 app `lumi-ride-dev` on port `3000`

- `.github/workflows/deploy-main.yml`
  - Manual trigger (`workflow_dispatch`)
  - Uses `environment: production` (you can add required reviewers for approval)
  - Deploys branch `main`, PM2 app `lumi-ride-main` on port `3001`

## 5) Nginx reverse proxy

Example dev vhost:

```nginx
server {
    listen 80;
    server_name 13.239.237.63;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/lumi-dev /etc/nginx/sites-enabled/lumi-dev
sudo nginx -t
sudo systemctl reload nginx
```

For main, create another server block (domain preferred) proxying to `127.0.0.1:3001`.

## 6) First manual deploy test on server

```bash
cd /var/www/lumi-ride-dev
bash ./scripts/deploy-ec2.sh dev
pm2 status
```

## 7) Main deploy confirmation flow

Use GitHub Actions:

1. Open `Deploy Main to EC2`
2. Run workflow manually
3. Approve production environment if required

