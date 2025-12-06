# Production Deployment Guide (Actual Setup)

This guide covers deploying to your actual production environment.

---

## Current Production Configuration

### Image Source
- **Registry**: GitHub Container Registry (GHCR)
- **Image**: `ghcr.io/ostendo-io/wawagardenbar-app:main`
- **Tag**: `main` (tracks the main branch)

### Container Details
- **Container Name**: `food_app`
- **Port**: 3002 (bound to 127.0.0.1 only)
- **Network**: `ostendo-network` (external, shared with other services)
- **MongoDB**: Uses shared `mongo` container on the same network

---

## Updating to Latest Version

### Method 1: Pull and Recreate (Recommended)
```bash
# Pull the latest image
docker pull ghcr.io/ostendo-io/wawagardenbar-app:main

# Stop and remove the old container
docker stop food_app
docker rm food_app

# Start with the new image (docker-compose will recreate)
docker-compose -f docker-compose.prod.yml up -d food_app

# Verify it's running
docker ps | grep food_app
docker logs -f food_app
```

### Method 2: Using Docker Compose
```bash
# Pull latest image
docker-compose -f docker-compose.prod.yml pull food_app

# Recreate the container with new image
docker-compose -f docker-compose.prod.yml up -d --force-recreate food_app

# Check logs
docker-compose -f docker-compose.prod.yml logs -f food_app
```

### Method 3: One-Command Update
```bash
docker pull ghcr.io/ostendo-io/wawagardenbar-app:main && \
docker stop food_app && \
docker rm food_app && \
docker-compose -f docker-compose.prod.yml up -d food_app
```

---

## Deployment Script (Customized)

Create `deploy-prod.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Wawa Garden Bar (Production)..."
echo ""

# Pull latest image
echo "📦 Pulling latest image from GHCR..."
docker pull ghcr.io/ostendo-io/wawagardenbar-app:main

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull image!"
    echo "   Make sure you're authenticated: docker login ghcr.io"
    exit 1
fi

echo "✅ Image pulled successfully"
echo ""

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop food_app 2>/dev/null || true
docker rm food_app 2>/dev/null || true

# Start new container
echo "🔄 Starting new container..."
docker-compose -f docker-compose.prod.yml up -d food_app

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "✅ Container started"
echo ""

# Wait for health check
echo "⏳ Waiting for application to be healthy (30 seconds)..."
sleep 30

# Check if container is running
if docker ps | grep -q food_app; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Container status:"
    docker ps | grep food_app
    echo ""
    echo "📋 Recent logs:"
    docker logs --tail=20 food_app
    echo ""
    echo "🌐 Application is running on port 3002"
else
    echo "❌ Container is not running!"
    echo ""
    echo "📋 Logs:"
    docker logs food_app
    exit 1
fi
```

Make it executable:
```bash
chmod +x deploy-prod.sh
```

---

## Important Notes

### Port Configuration
- **Internal Port**: 3002 (inside container)
- **External Port**: 3002 (bound to 127.0.0.1 only)
- **Access**: Only accessible from localhost or via reverse proxy

### Network Configuration
- Uses external network `ostendo-network`
- Shares network with MongoDB container named `mongo`
- MongoDB accessible at `mongo:27017` from within the network

### Environment Variables
Your production uses these specific variables:
- `MONGODB_WAWAGARDENBAR_APP_URI` (not `MONGODB_URI`)
- `SESSION_PASSWORD` (not `SESSION_SECRET`)
- `SMTP_*` variables (for email)
- `NEXT_PUBLIC_API_URL` (additional public URL)
- `MONGODB_DB_NAME` (database name)
- `MONNIFY_WEBHOOK_SECRET` (webhook verification)
- `Wallet_Account_Number` (payment integration)

### Image Tag Strategy
- **Current**: Uses `main` tag (always latest from main branch)
- **Alternative**: Use commit SHA tags for specific versions (e.g., `main-abc1234`)

---

## Rollback to Previous Version

### Option 1: Use Specific Commit Tag
```bash
# Find available tags at:
# https://github.com/ostendo-io/wawagardenbar-app/pkgs/container/wawagardenbar-app

# Pull specific version
docker pull ghcr.io/ostendo-io/wawagardenbar-app:main-abc1234

# Update docker-compose.prod.yml temporarily
# Change: image: ghcr.io/ostendo-io/wawagardenbar-app:main
# To:     image: ghcr.io/ostendo-io/wawagardenbar-app:main-abc1234

# Recreate container
docker-compose -f docker-compose.prod.yml up -d --force-recreate food_app
```

### Option 2: Use Previous Image
```bash
# List local images
docker images | grep wawagardenbar-app

# Tag a previous image as 'main'
docker tag ghcr.io/ostendo-io/wawagardenbar-app@sha256:OLD_SHA ghcr.io/ostendo-io/wawagardenbar-app:main

# Recreate container
docker-compose -f docker-compose.prod.yml up -d --force-recreate food_app
```

---

## Monitoring

### View Logs
```bash
# Follow logs in real-time
docker logs -f food_app

# View last 100 lines
docker logs --tail=100 food_app

# View logs with timestamps
docker logs -f --timestamps food_app
```

### Check Container Status
```bash
# Container status
docker ps | grep food_app

# Resource usage
docker stats food_app

# Inspect container
docker inspect food_app
```

### Check Health
```bash
# From the server (localhost only)
curl http://127.0.0.1:3002/api/health

# Check if container is responding
docker exec food_app curl -f http://localhost:3002/api/health
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs food_app

# Check if port is in use
sudo lsof -i :3002

# Check if network exists
docker network ls | grep ostendo-network

# Check environment variables
docker exec food_app env | grep MONGODB
```

### Image Pull Fails
```bash
# Re-authenticate with GHCR
docker logout ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Verify image exists
docker pull ghcr.io/ostendo-io/wawagardenbar-app:main
```

### MongoDB Connection Issues
```bash
# Check if mongo container is running
docker ps | grep mongo

# Test connection from food_app container
docker exec food_app ping -c 3 mongo

# Check MongoDB logs
docker logs mongo
```

### Network Issues
```bash
# Verify network exists
docker network inspect ostendo-network

# Check which containers are on the network
docker network inspect ostendo-network | grep -A 5 Containers

# Recreate network connection
docker network disconnect ostendo-network food_app
docker network connect ostendo-network food_app
```

---

## GitHub Actions Integration

Your workflow builds and pushes to:
- `ghcr.io/ostendo-io/wawagardenbar-app:main` (on push to main branch)
- `ghcr.io/ostendo-io/wawagardenbar-app:develop` (on push to develop branch)
- `ghcr.io/ostendo-io/wawagardenbar-app:main-<commit-sha>` (commit-specific tags)

### Deployment Workflow
1. Push code to `main` branch
2. GitHub Actions builds and publishes image (~8-10 min first time, ~2-3 min cached)
3. Wait for Actions to complete
4. SSH to production server
5. Run `./deploy-prod.sh` or manual pull/restart commands

---

## Security Considerations

### Port Binding
- Port 3002 is bound to `127.0.0.1` only (not exposed to internet)
- Access via reverse proxy (Nginx/Caddy) recommended
- Ensures application is not directly accessible from outside

### Secrets Management
- All secrets in `.env` file (not committed to git)
- MongoDB password in `TRADINGAPI_MONGO_PASSWORD`
- Session password in `SESSION_PASSWORD`
- Payment gateway secrets properly configured

### Container Permissions
- Container runs as non-root user (UID 1001)
- Limited access to host system
- Isolated in Docker network

---

## Performance Tips

### Image Optimization
With the new optimizations:
- Image size: ~450MB (was ~1.3GB)
- Pull time: ~30-60 seconds (was 2-3 minutes)
- Startup time: ~10-15 seconds

### Container Resources
Consider adding resource limits:
```yaml
services:
  food_app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Quick Reference

```bash
# Update to latest
./deploy-prod.sh

# View logs
docker logs -f food_app

# Restart container
docker restart food_app

# Check status
docker ps | grep food_app

# Shell access
docker exec -it food_app sh

# Check health
curl http://127.0.0.1:3002/api/health
```
