#!/bin/bash

# FlexiBug Beauty - Docker-Only Server Setup Script
# This script sets up a Ubuntu/Debian server for Docker deployment only

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
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"

echo -e "${BLUE}🐳 Setting up FlexiBug Beauty server for Docker deployment...${NC}"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    ufw

# Install Node.js 18 (for building if needed)
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
print_warning "You'll need to log out and back in for Docker group changes to take effect."

# Configure firewall for Docker ports
# Configure firewall for Docker and PostgreSQL ports (SAFE VERSION)
print_status "Configuring firewall for Docker and PostgreSQL ports..."

# Check if UFW is already enabled
if sudo ufw status | grep -q "Status: active"; then
    print_warning "UFW firewall is already enabled. Adding required ports..."
    sudo ufw allow 8080  # Docker app port
    sudo ufw allow 8443  # Docker app HTTPS port
    sudo ufw allow 5432  # PostgreSQL port
    sudo ufw allow 22
    print_status "Required ports added to existing firewall rules"
else
    print_warning "UFW firewall is not enabled. Would you like to enable it? (y/n)"
    read -p "Enable firewall? " ENABLE_FIREWALL
    
    if [ "$ENABLE_FIREWALL" = "y" ] || [ "$ENABLE_FIREWALL" = "Y" ]; then
        print_warning "Enabling UFW firewall with safe defaults..."
        
        # Enable UFW with safe defaults
        sudo ufw --force enable
        
        # Allow essential services
        sudo ufw allow ssh
        sudo ufw allow 22/tcp  # SSH alternative port
        
        # Allow common web ports
        sudo ufw allow 80/tcp   # HTTP
        sudo ufw allow 443/tcp  # HTTPS
        
        # Allow Docker ports
        sudo ufw allow 8080/tcp  # Docker app port
        sudo ufw allow 8443/tcp  # Docker app HTTPS port
        
        # Allow PostgreSQL port
        sudo ufw allow 5432/tcp  # PostgreSQL
        
        print_status "Firewall enabled with safe defaults including PostgreSQL"
    else
        print_warning "Skipping firewall configuration"
        print_warning "Make sure ports 8080, 8443, and 5432 are accessible if needed"
    fi
fi

# Show current firewall status
print_status "Current firewall status:"
sudo ufw status numbered

# Start and enable Docker
print_status "Starting and enabling Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Create Docker deployment script
print_status "Creating Docker deployment script..."
cat > ~/docker-deploy.sh << 'EOF'
#!/bin/bash

# FlexiBug Beauty Docker Deployment Script
set -e

APP_NAME="flexibug-beauty"
CONTAINER_NAME="flexibug-beauty"
IMAGE_NAME="${DOCKER_USERNAME:-flexibug}/$APP_NAME"

echo "🐳 Starting Docker deployment..."

# Pull latest image
echo "📥 Pulling latest Docker image..."
docker pull $IMAGE_NAME:latest

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Remove old images to save space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Run new container
echo "🚀 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 8080:80 \
    -p 8443:443 \
    -e NODE_ENV=production \
    $IMAGE_NAME:latest

# Wait for container to start
sleep 10

# Check if container is running
if docker ps --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "✅ Container started successfully!"
    
    # Show container status
    echo "📊 Container Status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show container logs
    echo "📋 Recent Logs:"
    docker logs --tail 20 $CONTAINER_NAME
    
    # Health check
    echo "🏥 Performing health check..."
    sleep 5
    
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        echo "🌐 Application is available at: http://$DOMAIN_NAME:8080"
    else
        echo "⚠️ Health check failed. Check container logs:"
        docker logs $CONTAINER_NAME
    fi
    
else
    echo "❌ Failed to start container. Check Docker logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo "🎉 Docker deployment completed successfully!"
EOF

chmod +x ~/docker-deploy.sh

# Create Docker rollback script
print_status "Creating Docker rollback script..."
cat > ~/docker-rollback.sh << 'EOF'
#!/bin/bash

# FlexiBug Beauty Docker Rollback Script
set -e

CONTAINER_NAME="flexibug-beauty"

echo "🔄 Starting Docker rollback..."

# Check if container exists
if ! docker ps -a --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "❌ No container found for rollback."
    exit 1
fi

# Stop and remove current container
echo "🛑 Stopping current container..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

# List available images
echo "📋 Available images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep flexibug-beauty

# Ask user which image to rollback to
read -p "Enter the image tag to rollback to (e.g., latest, v1.0.0): " ROLLBACK_TAG

if [ -z "$ROLLBACK_TAG" ]; then
    echo "❌ No tag specified. Rollback cancelled."
    exit 1
fi

# Run container with specified image
echo "�� Starting container with image: $ROLLBACK_TAG"
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 8080:80 \
    -p 8443:443 \
    -e NODE_ENV=production \
    flexibug/flexibug-beauty:$ROLLBACK_TAG

echo "✅ Rollback completed successfully!"
EOF

chmod +x ~/docker-rollback.sh

# Create Docker monitoring script
print_status "Creating Docker monitoring script..."
cat > ~/docker-monitor.sh << 'EOF'
#!/bin/bash

# FlexiBug Beauty Docker Monitoring Script
CONTAINER_NAME="flexibug-beauty"
LOG_FILE="$HOME/docker-monitor.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if container is running
if ! docker ps --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    log "ERROR: Container $CONTAINER_NAME is not running"
    # Optionally restart the container
    # docker start $CONTAINER_NAME
    exit 1
fi

# Check container health
if ! curl -f http://localhost:8080/health > /dev/null 2>&1; then
    log "WARNING: Container health check failed"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log "WARNING: Disk usage is at ${DISK_USAGE}%"
fi

# Check Docker disk usage
DOCKER_DISK=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | grep Images | awk '{print $3}')
log "INFO: Docker disk usage: $DOCKER_DISK"

log "INFO: Docker health check completed"
EOF

chmod +x ~/docker-monitor.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/docker-monitor.sh") | crontab -

print_status "Docker-only setup completed successfully!"

echo -e "${BLUE}�� Next steps:${NC}"
echo "1. Log out and back in to apply Docker group changes"
echo "2. Configure GitHub Actions secrets:"
echo "   - SERVER_HOST: Your server IP or domain"
echo "   - SERVER_USER: Your server username"
echo "   - SERVER_SSH_KEY: Your private SSH key"
echo "   - DOCKER_USERNAME: Your Docker Hub username"
echo "   - DOCKER_PASSWORD: Your Docker Hub password"
echo "   - VITE_SUPABASE_URL: Your Supabase URL"
echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo ""
echo "3. Deploy using Docker:"
echo "   ./docker-deploy.sh"
echo ""
echo "4. Access your application:"
echo "   http://$DOMAIN_NAME:8080"
echo ""
echo "5. Useful Docker commands:"
echo "   - View logs: docker logs -f $CONTAINER_NAME"
echo "   - Stop container: docker stop $CONTAINER_NAME"
echo "   - Restart container: docker restart $CONTAINER_NAME"
echo "   - Remove container: docker rm -f $CONTAINER_NAME"
echo ""
echo -e "${GREEN}🎉 Your FlexiBug Beauty server is ready for Docker deployment!${NC}"