#!/bin/bash

# FlexiBug Beauty - Docker Deployment Script
# This script deploys the application using Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="flexibug-beauty"
CONTAINER_NAME="flexibug-beauty"
IMAGE_NAME="${DOCKER_USERNAME:-flexibug}/$APP_NAME"
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

echo -e "${BLUE}🐳 Deploying FlexiBug Beauty with Docker...${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull latest image
print_status "Pulling latest Docker image..."
docker pull $IMAGE_NAME:latest

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Remove old images to save space
print_status "Cleaning up old Docker images..."
docker image prune -f

# Run new container
print_status "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 80:80 \
    -p 443:443 \
    -e NODE_ENV=production \
    $IMAGE_NAME:latest

# Wait for container to start
sleep 10

# Check if container is running
if docker ps --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    print_status "Container started successfully!"
    
    # Show container status
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show container logs
    echo -e "${BLUE}📋 Recent Logs:${NC}"
    docker logs --tail 20 $CONTAINER_NAME
    
    # Health check
    echo -e "${BLUE}🏥 Performing health check...${NC}"
    sleep 5
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "Health check passed!"
    else
        print_warning "Health check failed. Check container logs:"
        docker logs $CONTAINER_NAME
    fi
    
else
    print_error "Failed to start container. Check Docker logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

print_status "Docker deployment completed successfully!"

echo -e "${BLUE}📋 Useful commands:${NC}"
echo "View logs: docker logs -f $CONTAINER_NAME"
echo "Stop container: docker stop $CONTAINER_NAME"
echo "Restart container: docker restart $CONTAINER_NAME"
echo "Remove container: docker rm -f $CONTAINER_NAME"
echo "Update image: docker pull $IMAGE_NAME:latest && $0"
