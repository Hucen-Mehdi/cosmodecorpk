#!/bin/bash

# ==========================================================================
# VPS Setup Script for Hostinger (Ubuntu 22.04)
# Installs: Node.js 20, PM2, Nginx, PostgreSQL, Redis, UFW
# ==========================================================================

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper for logging progress
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  error "Please run as root (use sudo)"
fi

# Trap errors
trap 'error "An error occurred during the installation process."' ERR

info "Starting VPS Setup for Ubuntu 22.04..."

# 1. Update system packages
info "Updating system packages..."
apt update && apt upgrade -y

# 2. Install essential build tools
info "Installing build-essential and curl..."
apt install -y build-essential curl software-properties-common

# 3. Install Node.js 20.x
info "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
info "Node.js version: $(node -v)"
info "NPM version: $(npm -v)"

# 4. Install PM2
info "Installing PM2 process manager..."
npm install -g pm2
pm2 startup | grep -o 'sudo.*' | bash
info "PM2 installed successfully"

# 5. Install Nginx
info "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
info "Nginx version: $(nginx -v 2>&1)"

# 6. Install PostgreSQL
info "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
info "PostgreSQL installed and running"

# 7. Install Redis
info "Installing Redis..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
info "Redis version: $(redis-server --version)"

# 8. Configure Firewall (UFW)
info "Configuring basic security (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# If you need specific ports like 3000 or 5000, uncomment below:
# ufw allow 3000/tcp
echo "y" | ufw enable
info "Firewall enabled (SSH and Nginx allowed)"

# 9. Verification Summary
info "===================================================="
info "             Setup Completed Successfully           "
info "===================================================="
echo -e "${YELLOW}Services Status:${NC}"
systemctl status nginx --no-pager | grep Active
systemctl status postgresql --no-pager | grep Active
systemctl status redis-server --no-pager | grep Active
echo -e "${YELLOW}Versions:${NC}"
node -v
npm -v
pm2 -v
nginx -v 2>&1
psql --version
redis-cli --version

info "Next steps:"
echo "1. Configure Nginx: /etc/nginx/sites-available/"
echo "2. Setup Postgres user/database: sudo -i -u postgres psql"
echo "3. Update your .env files with production credentials"
echo "4. Deploy your application code and start with PM2"
info "===================================================="
