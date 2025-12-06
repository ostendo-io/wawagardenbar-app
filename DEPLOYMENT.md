# Production Deployment Guide

This guide covers deploying the Wawa Garden Bar application to a production server using Docker and GitHub Container Registry.

---

## Overview

The deployment workflow:
1. **GitHub Actions** builds and pushes Docker images to GitHub Container Registry (GHCR)
2. **Production server** pulls the latest image from GHCR
3. **Docker Compose** orchestrates the application and MongoDB

---

## Prerequisites

### On Production Server

1. **Docker & Docker Compose installed**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

2. **GitHub Container Registry authentication**
   ```bash
   # Create a GitHub Personal Access Token (PAT) with 'read:packages' scope
   # Then login to GHCR
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Environment variables configured**
   ```bash
   # Copy and edit the environment file
   cp .env.docker.example .env
   nano .env
   ```

---

## Initial Deployment

### 1. Clone Repository (Optional)
You only need the docker-compose.prod.yml and .env files on the production server.

```bash
# Option A: Clone the repo
git clone https://github.com/ostendo-io/wawagardenbar-app.git
cd wawagardenbar-app

# Option B: Download just the necessary files
mkdir wawagardenbar-app && cd wawagardenbar-app
wget https://raw.githubusercontent.com/ostendo-io/wawagardenbar-app/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/ostendo-io/wawagardenbar-app/main/.env.docker.example
mv .env.docker.example .env
```

### 2. Configure Environment Variables
```bash
nano .env
```

Set all required variables:
- `SESSION_SECRET` - Random secure string
- `MONGODB_URI` - MongoDB connection string
- `MONNIFY_*` - Payment gateway credentials
- `EMAIL_*` - Email service credentials
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `GITHUB_REPOSITORY` - Your GitHub repo (e.g., `ostendo-io/wawagardenbar-app`)

### 3. Create Uploads Directory
```bash
mkdir -p uploads
chmod 755 uploads
```

### 4. Start the Application
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Verify Deployment
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## Updating to Latest Version

When a new version is pushed to GitHub and built by GitHub Actions:

### Method 1: Pull and Restart (Recommended)
```bash
# Navigate to your deployment directory
cd /path/to/wawagardenbar-app

# Pull the latest image
docker-compose -f docker-compose.prod.yml pull app

# Restart with the new image (zero-downtime with health checks)
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Verify the update
docker-compose -f docker-compose.prod.yml logs -f app
```

### Method 2: One-Command Update
```bash
# This pulls and restarts in one command
docker-compose -f docker-compose.prod.yml pull && \
docker-compose -f docker-compose.prod.yml up -d --force-recreate app
```

### Method 3: Complete Restart
```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start everything
docker-compose -f docker-compose.prod.yml up -d
```

---

## Automated Deployment Script

Create a deployment script for easy updates:

```bash
nano deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Wawa Garden Bar..."

# Navigate to deployment directory
cd /path/to/wawagardenbar-app

# Pull latest image
echo "📦 Pulling latest image from GHCR..."
docker-compose -f docker-compose.prod.yml pull app

# Restart application
echo "🔄 Restarting application..."
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
sleep 10

# Check health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "📊 Container status:"
    docker-compose -f docker-compose.prod.yml ps app
else
    echo "❌ Health check failed!"
    echo "📋 Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=50 app
    exit 1
fi
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## Rollback to Previous Version

If a deployment fails, rollback to a previous version:

### 1. List Available Tags
```bash
# View available image tags in GHCR
# Visit: https://github.com/ostendo-io/wawagardenbar-app/pkgs/container/wawagardenbar-app
```

### 2. Deploy Specific Version
```bash
# Edit docker-compose.prod.yml to use a specific tag
# Change: ghcr.io/ostendo-io/wawagardenbar-app:latest
# To:     ghcr.io/ostendo-io/wawagardenbar-app:main-abc1234

# Or use environment variable
export IMAGE_TAG=main-abc1234
docker-compose -f docker-compose.prod.yml up -d --force-recreate app
```

### 3. Quick Rollback Script
```bash
#!/bin/bash
# rollback.sh
TAG=${1:-latest}
echo "Rolling back to tag: $TAG"
docker pull ghcr.io/ostendo-io/wawagardenbar-app:$TAG
docker tag ghcr.io/ostendo-io/wawagardenbar-app:$TAG wawa-garden-bar:latest
docker-compose -f docker-compose.prod.yml up -d --force-recreate app
```

Usage:
```bash
./rollback.sh main-abc1234
```

---

## Monitoring & Maintenance

### View Logs
```bash
# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f app

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app

# View logs from specific time
docker-compose -f docker-compose.prod.yml logs --since 30m app
```

### Check Resource Usage
```bash
# Container stats
docker stats wawa-garden-bar

# Disk usage
docker system df
```

### Database Backup
```bash
# Backup MongoDB
docker exec wawa-mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp wawa-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Clean Up Old Images
```bash
# Remove unused images (keeps current)
docker image prune -a

# Remove old versions manually
docker images | grep wawagardenbar-app
docker rmi ghcr.io/ostendo-io/wawagardenbar-app:old-tag
```

---

## Troubleshooting

### Image Not Pulling
```bash
# Check authentication
docker login ghcr.io

# Manually pull image
docker pull ghcr.io/ostendo-io/wawagardenbar-app:latest

# Check image exists
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://ghcr.io/v2/ostendo-io/wawagardenbar-app/tags/list
```

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Verify MongoDB is healthy
docker-compose -f docker-compose.prod.yml ps mongodb
```

### Port Already in Use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process or change port in docker-compose.prod.yml
```

### Permission Issues with Uploads
```bash
# Fix permissions
sudo chown -R 1001:1001 uploads/
chmod -R 755 uploads/
```

---

## CI/CD Integration

### Webhook Deployment (Optional)

Set up a webhook to automatically deploy when GitHub Actions completes:

1. **Install webhook receiver on server**
   ```bash
   # Using webhook tool
   sudo apt-get install webhook
   ```

2. **Create webhook script**
   ```bash
   # /opt/webhooks/deploy-wawa.sh
   #!/bin/bash
   cd /path/to/wawagardenbar-app
   ./deploy.sh
   ```

3. **Configure webhook**
   ```json
   // /opt/webhooks/hooks.json
   [
     {
       "id": "deploy-wawa",
       "execute-command": "/opt/webhooks/deploy-wawa.sh",
       "command-working-directory": "/path/to/wawagardenbar-app",
       "response-message": "Deployment triggered"
     }
   ]
   ```

4. **Add webhook to GitHub**
   - Go to repository Settings → Webhooks
   - Add webhook URL: `http://your-server:9000/hooks/deploy-wawa`
   - Trigger on: Workflow runs

---

## Security Best Practices

1. **Use secrets for sensitive data**
   - Never commit `.env` files
   - Use environment variables or secret management tools

2. **Keep images updated**
   ```bash
   # Update base images regularly
   docker-compose -f docker-compose.prod.yml pull
   ```

3. **Limit container permissions**
   - Application runs as non-root user (UID 1001)
   - MongoDB data is isolated in volumes

4. **Use HTTPS in production**
   - Set up reverse proxy (Nginx/Caddy)
   - Configure SSL certificates

5. **Regular backups**
   - Automate MongoDB backups
   - Store backups off-server

---

## Performance Optimization

### Enable Docker BuildKit Cache
Already configured in GitHub Actions, but for local builds:
```bash
export DOCKER_BUILDKIT=1
```

### Limit Container Resources
```yaml
# Add to docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Use Docker Compose Profiles
For staging vs production:
```bash
docker-compose -f docker-compose.prod.yml --profile production up -d
```

---

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Review GitHub Actions: https://github.com/ostendo-io/wawagardenbar-app/actions
- Check image registry: https://github.com/ostendo-io/wawagardenbar-app/pkgs/container/wawagardenbar-app
