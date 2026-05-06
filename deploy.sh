#!/bin/bash
set -euo pipefail

# MediCare Pro - Deploy to Hostinger VPS
# Usage:
#   ./deploy.sh --setup    First time: install Docker + deploy
#   ./deploy.sh            Update: rebuild and redeploy
#   ./deploy.sh --db-only  Just reset the database

VPS_IP="2.24.80.103"
VPS_USER="root"
APP_DIR="/opt/medicare-pro"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }

# Check .env.production exists
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found. Run: cp .env.production.example .env.production"
    exit 1
fi

# First-time VPS setup
setup_vps() {
    log "Installing Docker on VPS..."
    ssh "${VPS_USER}@${VPS_IP}" bash -s <<'REMOTE'
        set -euo pipefail
        if ! command -v docker &> /dev/null; then
            apt-get update
            apt-get install -y ca-certificates curl gnupg
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            chmod a+r /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            systemctl enable docker
            echo "Docker installed."
        else
            echo "Docker already installed: $(docker --version)"
        fi
        mkdir -p /opt/medicare-pro
REMOTE
    log "VPS setup complete."
}

# Sync files to VPS
sync_files() {
    log "Syncing files to VPS..."
    rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.claude' \
        --exclude='.bolt' \
        --exclude='.sixth' \
        --exclude='.github' \
        --exclude='*.log' \
        --exclude='dist' \
        --exclude='hostinger-openapi.json' \
        --exclude='railway-api.html' \
        --exclude='railway-manage-domains.html' \
        --exclude='SQL_EXAMPLES_TEMPORAL.sql' \
        --exclude='ANALYTICS_SUCCESS.txt' \
        --exclude='supabase' \
        ./ "${VPS_USER}@${VPS_IP}:${APP_DIR}/"

    # Copy production env as .env (docker-compose reads .env by default)
    scp .env.production "${VPS_USER}@${VPS_IP}:${APP_DIR}/.env"
    log "Files synced."
}

# Build and start containers
start_containers() {
    log "Building and starting containers on VPS..."
    ssh "${VPS_USER}@${VPS_IP}" bash -s <<REMOTE
        set -euo pipefail
        cd ${APP_DIR}

        # Stop existing
        docker compose down 2>/dev/null || true

        # Build and start
        docker compose up -d --build

        echo ""
        echo "=== Container Status ==="
        docker compose ps

        echo ""
        echo "=== Waiting for services... ==="
        sleep 10

        echo ""
        echo "=== Health Checks ==="
        echo -n "PostgreSQL: "
        docker compose exec -T db pg_isready -U medicare && echo "OK" || echo "FAILED"

        echo -n "PostgREST:  "
        curl -sf http://localhost:3000/ > /dev/null && echo "OK" || echo "FAILED"

        echo -n "Frontend:   "
        curl -sf -o /dev/null -w "HTTP %{http_code}" http://localhost/ && echo " OK" || echo "FAILED"

        echo ""
        echo "=== API Test ==="
        curl -sf "http://localhost/rest/v1/medics?select=username,specialite&limit=1" \
            -H "apikey: \$(grep ANON_KEY .env | cut -d= -f2)" \
            -H "Authorization: Bearer \$(grep ANON_KEY .env | cut -d= -f2)" || echo "API not ready yet"
REMOTE

    log "Deploy complete!"
    log "App: http://${VPS_IP}"
    log "API: http://${VPS_IP}/rest/v1/"
}

# Database reset only
db_reset() {
    log "Resetting database..."
    ssh "${VPS_USER}@${VPS_IP}" bash -s <<REMOTE
        cd ${APP_DIR}
        docker compose down db
        docker volume rm medicare-pro_pgdata 2>/dev/null || true
        docker compose up -d db
        sleep 5
        docker compose restart postgrest
        echo "Database reset complete."
REMOTE
}

# Main
case "${1:-deploy}" in
    --setup)
        setup_vps
        sync_files
        start_containers
        ;;
    --db-only)
        db_reset
        ;;
    *)
        sync_files
        start_containers
        ;;
esac
