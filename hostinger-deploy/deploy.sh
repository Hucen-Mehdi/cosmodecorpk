#!/bin/bash

# ==========================================================================
# Deployment Script for Next.js + Node.js
# ==========================================================================

# Exit on error
set -e

# Configuration
APP_NAME="cosmo-decor"
PM2_FRONTEND_NAME="cosmo-frontend"
PM2_SERVER_NAME="cosmo-server"
BACKUP_DIR="$HOME/deploy_backups"
LOG_FILE="$HOME/deploy.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helpers
log() {
    echo -e "${GREEN}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    # Prompt for rollback if needed
    if [ "$2" == "allow_rollback" ]; then
        rollback
    fi
    exit 1
}

backup() {
    log "Creating backup of current version..."
    mkdir -p "$BACKUP_DIR"
    # Create a backup of the current folder excluding node_modules and .next
    tar --exclude='./node_modules' --exclude='./.next' --exclude='./server/node_modules' --exclude='./server/dist' -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" .
    log "Backup saved to $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
}

rollback() {
    warn "Starting rollback to previous backup..."
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz | head -n 1)
    if [ -z "$LATEST_BACKUP" ]; then
        error_exit "No backup found to rollback to."
    fi
    
    log "Restoring from $LATEST_BACKUP..."
    tar -xzf "$LATEST_BACKUP" -C .
    
    log "Restarting services after rollback..."
    pm2 restart "$PM2_FRONTEND_NAME" || warn "Could not restart frontend"
    pm2 restart "$PM2_SERVER_NAME" || warn "Could not restart server"
    
    log "Rollback completed."
}

# Check for rollback command
if [ "$1" == "rollback" ]; then
    rollback
    exit 0
fi

# Main Deployment Flow
log "Starting deployment of $APP_NAME..."

# Step 1: Backup
backup

# Step 2: Git Pull
log "Pulling latest code from git..."
git pull origin main || error_exit "Git pull failed" "allow_rollback"

# Step 3: Install Dependencies
log "Installing root dependencies..."
npm ci || error_exit "Root dependencies installation failed" "allow_rollback"

if [ -d "server" ]; then
    log "Installing server dependencies..."
    cd server && npm ci && cd .. || error_exit "Server dependencies installation failed" "allow_rollback"
fi

# Step 4: Build
log "Building frontend and server..."
npm run build || error_exit "Build failed" "allow_rollback"

# Step 5: Database Migrations
log "Running database migrations..."
npm run db:migrate || error_exit "Database migration failed" "allow_rollback"

# Step 6: Restart PM2
log "Restarting PM2 services..."

# Check if processes exist before restarting, otherwise start them
if pm2 list | grep -q "$PM2_FRONTEND_NAME"; then
    pm2 restart "$PM2_FRONTEND_NAME"
else
    pm2 start npm --name "$PM2_FRONTEND_NAME" -- start:frontend
fi

if pm2 list | grep -q "$PM2_SERVER_NAME"; then
    pm2 restart "$PM2_SERVER_NAME"
else
    pm2 start npm --name "$PM2_SERVER_NAME" -- start:server
fi

# Save PM2 state
pm2 save

log "Deployment completed successfully!"
log "===================================================="
