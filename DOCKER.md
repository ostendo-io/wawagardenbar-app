# Docker Deployment Guide

## Image Information

- **Image Name:** `wawa-garden-bar:latest`
- **Image Size:** 2.34GB
- **Base Image:** Node.js 20 Alpine
- **Build Date:** December 5, 2025

## Building the Image

```bash
docker build -t wawa-garden-bar:latest .
```

## Running the Container

### Basic Run (Development/Testing)

```bash
docker run -d \
  --name wawa-garden-bar \
  -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_connection_string" \
  -e SESSION_SECRET="your_session_secret" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  wawa-garden-bar:latest
```

### Production Run with Environment File

Create a `.env.production` file with your environment variables:

```env
# Database
MONGODB_URI=mongodb://your_mongodb_host:27017/wawa-garden-bar

# Session
SESSION_SECRET=your_secure_session_secret_here

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Payment Gateways
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Email
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@your-domain.com

# Instagram (Optional)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
```

Then run:

```bash
docker run -d \
  --name wawa-garden-bar \
  -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/public/uploads:/app/public/uploads \
  --restart unless-stopped \
  wawa-garden-bar:latest
```

## Docker Compose (Recommended for Production)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    image: wawa-garden-bar:latest
    container_name: wawa-garden-bar
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - SESSION_SECRET=${SESSION_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - MONNIFY_API_KEY=${MONNIFY_API_KEY}
      - MONNIFY_SECRET_KEY=${MONNIFY_SECRET_KEY}
      - MONNIFY_CONTRACT_CODE=${MONNIFY_CONTRACT_CODE}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
      - PAYSTACK_PUBLIC_KEY=${PAYSTACK_PUBLIC_KEY}
      - EMAIL_HOST=${EMAIL_HOST}
      - EMAIL_PORT=${EMAIL_PORT}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
      - EMAIL_FROM=${EMAIL_FROM}
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - wawa-network

  # Optional: MongoDB container (if not using external MongoDB)
  mongodb:
    image: mongo:7
    container_name: wawa-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your_secure_password
      - MONGO_INITDB_DATABASE=wawa-garden-bar
    volumes:
      - mongodb-data:/data/db
    restart: unless-stopped
    networks:
      - wawa-network

networks:
  wawa-network:
    driver: bridge

volumes:
  mongodb-data:
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Container Management

### View Logs

```bash
docker logs wawa-garden-bar
docker logs -f wawa-garden-bar  # Follow logs
```

### Stop Container

```bash
docker stop wawa-garden-bar
```

### Start Container

```bash
docker start wawa-garden-bar
```

### Restart Container

```bash
docker restart wawa-garden-bar
```

### Remove Container

```bash
docker stop wawa-garden-bar
docker rm wawa-garden-bar
```

### Execute Commands Inside Container

```bash
docker exec -it wawa-garden-bar sh
```

## Health Check

The container includes a health check endpoint at `/api/health`. You can verify the container is healthy:

```bash
curl http://localhost:3000/api/health
```

Or check Docker health status:

```bash
docker ps
```

Look for the `STATUS` column showing `healthy`.

## Volume Mounts

### Persistent Uploads

To persist uploaded images (menu items, etc.), mount the uploads directory:

```bash
-v $(pwd)/uploads:/app/public/uploads
```

### Custom Configuration

If you need to override configuration files, you can mount them:

```bash
-v $(pwd)/custom-config.json:/app/config.json
```

## Networking

### Expose to External Network

```bash
docker run -d \
  --name wawa-garden-bar \
  -p 80:3000 \
  --env-file .env.production \
  wawa-garden-bar:latest
```

### Behind Reverse Proxy (Nginx/Traefik)

If using a reverse proxy, ensure you:
1. Set `NEXT_PUBLIC_APP_URL` to your domain
2. Configure proxy headers correctly
3. Enable WebSocket support for Socket.IO

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker logs wawa-garden-bar`
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check port 3000 is not already in use

### Database Connection Issues

1. Verify `MONGODB_URI` is correct
2. Ensure MongoDB is running and accessible
3. Check network connectivity between containers
4. Verify MongoDB credentials

### Permission Issues with Uploads

```bash
docker exec -it wawa-garden-bar sh -c "chown -R nextjs:nodejs /app/public/uploads"
```

### Memory Issues

If the container runs out of memory during build or runtime:

```bash
# Increase Docker memory limit
docker run -d \
  --name wawa-garden-bar \
  --memory="2g" \
  --memory-swap="2g" \
  -p 3000:3000 \
  --env-file .env.production \
  wawa-garden-bar:latest
```

## Security Considerations

1. **Never commit `.env` files** with sensitive credentials
2. **Use Docker secrets** for production deployments
3. **Run container as non-root user** (already configured in Dockerfile)
4. **Keep base images updated**: Regularly rebuild with latest Node.js Alpine
5. **Scan for vulnerabilities**: Use `docker scan wawa-garden-bar:latest`
6. **Use HTTPS** in production with proper SSL certificates
7. **Implement rate limiting** at reverse proxy level
8. **Regular backups** of MongoDB data and uploads volume

## Performance Optimization

### Multi-stage Build Benefits

The Dockerfile uses multi-stage builds to:
- Reduce final image size
- Separate build dependencies from runtime
- Improve security by excluding dev dependencies

### Resource Limits

Set appropriate resource limits in production:

```yaml
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

## Monitoring

### Container Stats

```bash
docker stats wawa-garden-bar
```

### Health Check Status

```bash
docker inspect --format='{{.State.Health.Status}}' wawa-garden-bar
```

## Updates and Maintenance

### Updating the Application

1. Pull latest code changes
2. Rebuild the image:
   ```bash
   docker build -t wawa-garden-bar:latest .
   ```
3. Stop and remove old container:
   ```bash
   docker stop wawa-garden-bar
   docker rm wawa-garden-bar
   ```
4. Start new container with updated image
5. Verify application is running correctly

### Database Migrations

If schema changes are needed:

```bash
docker exec -it wawa-garden-bar npm run migrate
```

## Support

For issues or questions:
- Check application logs: `docker logs wawa-garden-bar`
- Review this documentation
- Check Docker and Node.js versions compatibility
- Ensure all environment variables are properly configured
