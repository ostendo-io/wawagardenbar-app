#!/bin/bash
# Production Deployment Script for Wawa Garden Bar
# Customized for actual production environment

set -e  # Exit on error

echo "🚀 Deploying Wawa Garden Bar (Production)..."
echo ""

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    echo "   Make sure you're in the correct directory."
    exit 1
fi

# Pull latest image using docker-compose
echo "📦 Pulling latest image from GitHub Container Registry..."
docker-compose -f docker-compose.prod.yml pull app

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull image!"
    echo "   Make sure you're authenticated: docker login ghcr.io"
    exit 1
fi

echo "✅ Image pulled successfully"
echo ""

# Stop and remove old container
echo "🛑 Stopping old container..."
docker-compose -f docker-compose.prod.yml down

echo ""

# Start new container
echo "🔄 Starting new container..."
docker-compose -f docker-compose.prod.yml up -d app

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "✅ Container started"
echo ""

# Wait for application to initialize
echo "⏳ Waiting for application to initialize (30 seconds)..."
sleep 30

# Check if container is running
if docker ps | grep -q wawa-garden-bar; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Container status:"
    docker ps | grep wawa-garden-bar
    echo ""
    echo "📋 Recent logs:"
    docker logs --tail=20 wawa-garden-bar
    echo ""
    echo "🌐 Application is running on port 3002 (localhost only)"
    echo "   Access via reverse proxy or: curl http://127.0.0.1:3002/api/health"
else
    echo "❌ Container is not running!"
    echo ""
    echo "📋 Full logs:"
    docker logs wawa-garden-bar
    exit 1
fi
