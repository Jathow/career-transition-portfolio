#!/bin/bash

# Career Transition Portfolio - Production Deployment Script
# Task 14: Deploy to production and populate portfolio data

set -e  # Exit on any error

echo "🚀 Starting Career Transition Portfolio Production Deployment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"career-portfolio.yourdomain.com"}
EMAIL=${EMAIL:-"your-email@gmail.com"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"your-email@gmail.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"your-secure-password"}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Generate secure environment variables
generate_env_file() {
    print_status "Generating environment configuration..."
    
    # Generate secure passwords and secrets if not already set
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 64)
    fi
    if [ -z "$REDIS_PASSWORD" ]; then
        REDIS_PASSWORD=$(openssl rand -base64 32)
    fi
    
    cat > .env << EOF
# Database Configuration (SQLite)
DATABASE_URL=file:./prisma/prod.db

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Application Configuration
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://${DOMAIN}

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${EMAIL}
SMTP_PASS=your_app_password_here

# Domain Configuration
DOMAIN=${DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

    print_success "Environment file created"
}

# Set up SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Create SSL directory
    mkdir -p nginx/ssl
    
    if command_exists certbot; then
        print_status "Using Let's Encrypt for SSL certificates..."
        
        # Stop nginx if running to free up port 80
        docker-compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true
        
        # Request SSL certificate
        if sudo certbot certonly --standalone -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}; then
            # Copy certificates to nginx directory
            sudo cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem nginx/ssl/
            sudo cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem nginx/ssl/
            sudo chown -R $USER:$USER nginx/ssl/
            
            print_success "SSL certificates configured"
        else
            print_warning "Failed to obtain SSL certificate. Creating self-signed certificate for testing..."
            create_self_signed_cert
        fi
    else
        print_warning "Certbot not found. Creating self-signed certificate for testing..."
        create_self_signed_cert
    fi
}

# Create self-signed certificate for testing
create_self_signed_cert() {
    print_status "Creating self-signed SSL certificate..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/privkey.pem \
        -out nginx/ssl/fullchain.pem \
        -subj "/C=US/ST=CA/L=San Francisco/O=Career Portfolio/CN=${DOMAIN}"
    
    print_warning "Self-signed certificate created. Replace with proper SSL certificate for production."
}

# Create nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5001;
    }
    
    upstream frontend {
        server frontend:80;
    }
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    server {
        listen 80;
        server_name ${DOMAIN};
        return 301 https://\$server_name\$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN};
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # API with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    print_success "Nginx configuration created"
}

# Build and deploy application
deploy_application() {
    print_status "Building and deploying application..."
    
    # Build and start all services
    docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    docker-compose -f docker-compose.prod.yml ps
    
    # Clear caches after deployment
    print_status "Clearing caches to ensure updates are visible..."
    ./scripts/clear-cache.sh
    
    print_success "Application deployed successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Generate Prisma client and run migrations
    docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    
    print_success "Database migrations completed"
}

# Create admin user and populate demo data
setup_data() {
    print_status "Setting up admin user and demo data..."
    
    # Populate demo data first (creates demo users)
    docker-compose -f docker-compose.prod.yml exec backend node scripts/demoData.js
    
    print_success "Demo data created"
}

# Create the specific user account
create_user_account() {
    print_status "Creating user account..."
    
    # Use the setupUser script
    docker-compose -f docker-compose.prod.yml exec backend node scripts/setupUser.js
    
    print_success "User account created"
}

# Add the Career Transition Portfolio project to the user's portfolio
add_portfolio_project() {
    print_status "Adding Career Transition Portfolio project to user's portfolio..."
    
    # The setupUser script already includes the portfolio project
    print_status "Portfolio project is included in the user setup script"
    
    print_success "Career Transition Portfolio project added to user's portfolio"
}

# Set up monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create log directory
    sudo mkdir -p /var/log
    sudo touch /var/log/career-portfolio-monitor.log
    sudo chown $USER:$USER /var/log/career-portfolio-monitor.log
    
    # Copy monitoring script to system location
    sudo cp scripts/production-monitoring.sh /usr/local/bin/career-portfolio-monitor.sh
    sudo chmod +x /usr/local/bin/career-portfolio-monitor.sh
    
    # Set up cron jobs for monitoring and backups
    (crontab -l 2>/dev/null; echo "*/5 * * * * DOMAIN=${DOMAIN} /usr/local/bin/career-portfolio-monitor.sh monitor >> /var/log/career-portfolio-monitor.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "0 2 * * * DOMAIN=${DOMAIN} /usr/local/bin/career-portfolio-monitor.sh backup >> /var/log/career-portfolio-monitor.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "0 */6 * * * DOMAIN=${DOMAIN} /usr/local/bin/career-portfolio-monitor.sh performance >> /var/log/career-portfolio-monitor.log 2>&1") | crontab -
    
    # Set up log rotation
    sudo tee /etc/logrotate.d/career-portfolio << EOF
/var/log/career-portfolio-monitor.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    print_success "Monitoring and backup system configured"
    print_status "Monitoring runs every 5 minutes, backups daily at 2 AM, performance checks every 6 hours"
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Wait for application to be fully ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    local test_failed=false
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f -s "https://${DOMAIN}/health" > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        test_failed=true
    fi
    
    # Test API endpoint
    print_status "Testing API health endpoint..."
    if curl -f -s "https://${DOMAIN}/api/health" > /dev/null 2>&1; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        test_failed=true
    fi
    
    # Test frontend
    print_status "Testing frontend..."
    if curl -f -s "https://${DOMAIN}/" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
        test_failed=true
    fi
    
    # Test SSL certificate
    print_status "Testing SSL certificate..."
    if echo | openssl s_client -servername ${DOMAIN} -connect ${DOMAIN}:443 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        print_success "SSL certificate is valid"
    else
        print_warning "SSL certificate validation failed (may be self-signed)"
    fi
    
    # Test database connectivity through API
    print_status "Testing database connectivity..."
    if curl -f -s "https://${DOMAIN}/api/health" | grep -q "healthy"; then
        print_success "Database connectivity test passed"
    else
        print_error "Database connectivity test failed"
        test_failed=true
    fi
    
    # Test response time
    print_status "Testing response time..."
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "https://${DOMAIN}/")
    local response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null || echo "N/A")
    
    if [ "$response_time_ms" != "N/A" ]; then
        print_status "Response time: ${response_time_ms}ms"
        if (( $(echo "$response_time > 5.0" | bc -l 2>/dev/null || echo 0) )); then
            print_warning "Response time is slow (>${response_time_ms}ms)"
        fi
    fi
    
    if [ "$test_failed" = true ]; then
        print_error "Some deployment tests failed"
        return 1
    else
        print_success "All deployment tests passed"
        return 0
    fi
}

# Display deployment information
display_info() {
    echo ""
    echo "🎉 Career Transition Portfolio Deployment Complete!"
    echo "================================================"
    echo ""
    echo "🌐 Application URL: https://${DOMAIN}"
    echo "📊 Health Check: https://${DOMAIN}/health"
    echo ""
    echo "👤 User Accounts:"
    echo "   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}"
    echo "   User: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}"
    echo "   Demo: demo@careerportfolio.com / DemoPass123!"
    echo ""
    echo "📁 Important Files:"
    echo "   Environment: .env"
    echo "   Docker Compose: docker-compose.prod.yml"
    echo "   Nginx Config: nginx/nginx.conf"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "   Update: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
    echo "   Backup: /usr/local/bin/backup-portfolio.sh"
    echo ""
    echo "📈 Monitoring:"
    echo "   Health check runs every 5 minutes"
    echo "   Database backup runs daily at 2 AM"
    echo "   Logs: docker-compose -f docker-compose.prod.yml logs"
    echo ""
    echo "🔒 Security:"
    echo "   SSL certificates configured"
    echo "   Rate limiting enabled"
    echo "   Security headers configured"
    echo ""
    echo "📚 Documentation:"
    echo "   API Docs: https://${DOMAIN}/api/docs"
    echo "   User Guide: https://${DOMAIN}/docs"
    echo ""
}

# Main deployment function
main() {
    echo "Starting deployment at $(date)"
    
    check_prerequisites
    generate_env_file
    setup_ssl
    setup_nginx
    deploy_application
    run_migrations
    setup_data
    create_user_account
    add_portfolio_project
    setup_monitoring
    test_deployment
    display_info
    
    echo "Deployment completed at $(date)"
}

# Run main function
main "$@" 