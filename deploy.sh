#!/bin/bash
# Production Deployment Script for Wawa Garden Bar
# This script pulls the latest Docker image and restarts the application

set -e  # Exit on error

echo "🚀 Deploying Wawa Garden Bar..."
echo ""

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    echo "   Make sure you're in the correct directory."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Using environment variables from shell."
    echo ""
fi

# Pull latest image
echo "📦 Pulling latest image from GitHub Container Registry..."
docker-compose -f docker-compose.prod.yml pull app

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull image!"
    echo "   Make sure you're authenticated: docker login ghcr.io"
    exit 1
fi

echo "✅ Image pulled successfully"
echo ""

# Restart application
echo "🔄 Restarting application..."
docker-compose -f docker-compose.prod.yml up -d --no-deps app

if [ $? -ne 0 ]; then
    echo "❌ Failed to restart application!"
    exit 1
fi

echo "✅ Application restarted"
echo ""

# Wait for health check
echo "⏳ Waiting for application to be healthy (30 seconds)..."
sleep 30

# Check health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Container status:"
    docker-compose -f docker-compose.prod.yml ps app
    echo ""
    echo "🌐 Application is running at: http://localhost:3000"
else
    echo "❌ Health check failed!"
    echo ""
    echo "📋 Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=50 app
    exit 1
fi
