# FlexiBug Beauty - Linux Server Deployment Guide

This guide provides comprehensive instructions for deploying the FlexiBug Beauty application to a Linux server using GitHub Actions.

## 🚀 Quick Start

### Prerequisites

- Ubuntu/Debian Linux server (20.04+ recommended)
- Domain name pointing to your server (optional but recommended)
- GitHub repository with the FlexiBug Beauty code
- SSH access to your server

### 1. Server Setup

Run the automated server setup script:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-username/flexibug-beauty/main/scripts/setup-server.sh | bash

# Or clone the repository and run locally
git clone https://github.com/your-username/flexibug-beauty.git
cd flexibug-beauty
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_HOST` | Your server IP or domain | `192.168.1.100` or `your-domain.com` |
| `SERVER_USER` | SSH username | `ubuntu` or `root` |
| `SERVER_SSH_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DOCKER_USERNAME` | Docker Hub username (for Docker deployment) | `your-dockerhub-username` |
| `DOCKER_PASSWORD` | Docker Hub password/token | `your-dockerhub-password` |

### 3. Deploy

Push to the `main` or `master` branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

## 📋 Deployment Methods

### Method 1: Direct File Deployment (Recommended)

The GitHub Actions workflow will:
1. Build the React application
2. Upload files directly to your server via SSH
3. Configure Nginx to serve the application
4. Perform health checks

### Method 2: Docker Deployment

For containerized deployment:

1. Ensure Docker is installed on your server
2. The workflow will build and push a Docker image
3. Deploy using the containerized approach

## 🔧 Manual Deployment

### Using the Deployment Script

```bash
# SSH into your server
ssh user@your-server

# Navigate to the application directory
cd /var/www/flexibug-beauty

# Run the deployment script
./deploy.sh
```

### Using Docker

```bash
# Run the Docker deployment script
./scripts/docker-deploy.sh
```

## 🛠️ Configuration

### Environment Variables

Copy the environment template and configure:

```bash
cp env.example .env
nano .env
```

Key variables to configure:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_APP_URL`: Your application URL

### Nginx Configuration

The setup script creates an optimized Nginx configuration at:
- `/etc/nginx/sites-available/flexibug-beauty`
- `/etc/nginx/sites-enabled/flexibug-beauty`

### SSL Certificate (Recommended)

Install SSL certificate using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Maintenance

### Health Checks

The application includes health check endpoints:
- `http://your-domain.com/health` - Application health
- `http://your-domain.com/` - Main application

### Logs

Application logs are available at:
- Nginx logs: `/var/log/nginx/`
- Application logs: `/var/www/flexibug-beauty/logs/`
- System logs: `journalctl -u flexibug-beauty`

### Backup & Rollback

#### Automatic Backups
- Deployments automatically create backups
- Last 5 backups are retained
- Backups stored in `/var/www/flexibug-beauty/backup/`

#### Manual Rollback
```bash
cd /var/www/flexibug-beauty
./rollback.sh
```

### Monitoring Script

A monitoring script runs every 5 minutes to check:
- Nginx service status
- Application directory existence
- Disk and memory usage
- System health

## 🔒 Security

### Firewall Configuration

The setup script configures UFW firewall:
- SSH access (port 22)
- HTTP (port 80)
- HTTPS (port 443)

### Security Headers

Nginx is configured with security headers:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

### Rate Limiting

API endpoints are protected with rate limiting:
- General API: 10 requests/second
- Login endpoint: 5 requests/minute

## 🐛 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check GitHub Actions logs
# Verify SSH key and server access
ssh user@your-server

# Check server logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
```

#### 2. Application Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/flexibug-beauty/current/
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Debug Mode

Enable debug mode by setting environment variables:
```bash
export VITE_DEBUG=true
export VITE_ENABLE_DEBUG=true
```

## 📈 Performance Optimization

### Caching
- Static assets cached for 1 year
- Gzip compression enabled
- Browser caching optimized

### Monitoring
- Health check endpoint
- Automatic monitoring script
- Log rotation configured

### Scaling
- Nginx worker processes auto-configured
- Connection limits optimized
- Memory usage monitoring

## 🔄 Updates & Maintenance

### Automatic Updates
- GitHub Actions handles deployments
- Zero-downtime deployments
- Automatic rollback on failure

### Manual Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
npm run build
./deploy.sh
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services
sudo systemctl restart nginx
```

## 📞 Support

For deployment issues:
1. Check the GitHub Actions logs
2. Review server logs
3. Verify configuration files
4. Test connectivity and permissions

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
