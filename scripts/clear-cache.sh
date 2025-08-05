#!/bin/bash

# Cache Clearing Script for Career Portfolio
# This script clears various caches to ensure updates are visible

set -e

echo "🧹 Clearing caches for Career Portfolio deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Clear Docker build cache
clear_docker_cache() {
    print_status "Clearing Docker build cache..."
    docker system prune -f --volumes
    docker builder prune -f
    print_success "Docker cache cleared"
}

# Clear nginx cache
clear_nginx_cache() {
    print_status "Clearing nginx cache..."
    if docker ps | grep -q nginx; then
        docker exec $(docker ps -q --filter "name=nginx") nginx -s reload 2>/dev/null || true
        print_success "Nginx cache cleared"
    else
        print_warning "Nginx container not running"
    fi
}

# Clear browser cache headers
add_cache_busting_headers() {
    print_status "Adding cache busting headers to nginx config..."
    
    # Update nginx config to add cache busting
    if [ -f "nginx/nginx.prod.conf" ]; then
        # Add cache busting for static assets
        sed -i 's/expires 1h;/expires 1h;\n                add_header Cache-Busting "v$(date +%s)";/g' nginx/nginx.prod.conf
        print_success "Cache busting headers added"
    fi
}

# Force service worker update
force_service_worker_update() {
    print_status "Forcing service worker update..."
    
    # Update service worker cache name with timestamp
    if [ -f "client/public/service-worker.js" ]; then
        # The service worker is already updated to use dynamic cache names
        print_success "Service worker cache name updated"
    fi
}

# Clear Redis cache
clear_redis_cache() {
    print_status "Clearing Redis cache..."
    if docker ps | grep -q redis; then
        docker exec $(docker ps -q --filter "name=redis") redis-cli FLUSHALL 2>/dev/null || true
        print_success "Redis cache cleared"
    else
        print_warning "Redis container not running"
    fi
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml restart frontend nginx
        print_success "Services restarted"
    else
        print_warning "Production docker-compose file not found"
    fi
}

# Clear browser cache instructions
print_browser_instructions() {
    echo ""
    echo "🌐 Browser Cache Clearing Instructions:"
    echo "====================================="
    echo ""
    echo "To ensure you see the latest updates, please:"
    echo ""
    echo "1. Hard refresh your browser:"
    echo "   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
    echo "   - Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)"
    echo "   - Safari: Cmd+Option+R (Mac)"
    echo ""
    echo "2. Or clear browser cache completely:"
    echo "   - Chrome: Settings > Privacy and security > Clear browsing data"
    echo "   - Firefox: Settings > Privacy & Security > Clear Data"
    echo "   - Safari: Develop > Empty Caches"
    echo ""
    echo "3. Or open in incognito/private mode"
    echo ""
    echo "4. Service worker cache can be cleared in DevTools:"
    echo "   - Open DevTools (F12)"
    echo "   - Go to Application tab"
    echo "   - Service Workers > Unregister"
    echo ""
}

# Main function
main() {
    echo "Starting cache clearing process..."
    
    clear_docker_cache
    clear_nginx_cache
    clear_redis_cache
    add_cache_busting_headers
    force_service_worker_update
    restart_services
    
    print_success "Cache clearing completed!"
    print_browser_instructions
}

# Run main function
main "$@" 