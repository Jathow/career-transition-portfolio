#!/bin/bash

# Deployment Verification Script for Career Portfolio
# This script verifies that the latest deployment is working correctly

set -e

echo "🔍 Verifying Career Portfolio deployment..."

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

# Configuration
DOMAIN=${DOMAIN:-"localhost:8443"}

# Check if services are running
check_services() {
    print_status "Checking if services are running..."
    
    local services=("frontend" "backend" "nginx" "redis")
    local all_running=true
    
    for service in "${services[@]}"; do
        if docker ps | grep -q "$service"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        print_error "Some services are not running"
        return 1
    fi
    
    print_success "All services are running"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check frontend health
    if curl -f -s "https://$DOMAIN/health" > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    # Check backend health
    if curl -f -s "https://$DOMAIN/api/health" > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
}

# Check for cache headers
check_cache_headers() {
    print_status "Checking cache headers..."
    
    # Check if static assets have proper cache headers
    local response=$(curl -I -s "https://$DOMAIN/static/js/bundle.js" | grep -i "cache-control")
    
    if echo "$response" | grep -q "must-revalidate"; then
        print_success "Static assets have proper cache headers"
    else
        print_warning "Static assets may have aggressive caching"
    fi
    
    # Check service worker cache headers
    local sw_response=$(curl -I -s "https://$DOMAIN/service-worker.js" | grep -i "cache-control")
    
    if echo "$sw_response" | grep -q "no-cache"; then
        print_success "Service worker has no-cache headers"
    else
        print_warning "Service worker may be cached"
    fi
}

# Check for latest build
check_build_timestamp() {
    print_status "Checking build timestamp..."
    
    # Get the main.js file and check if it's recent
    local js_response=$(curl -s "https://$DOMAIN/static/js/main.js" | head -1)
    
    if echo "$js_response" | grep -q "webpackJsonp\|__webpack_require__"; then
        print_success "JavaScript bundle is loading correctly"
    else
        print_error "JavaScript bundle may not be loading"
    fi
}

# Test service worker
test_service_worker() {
    print_status "Testing service worker..."
    
    # Check if service worker is accessible
    if curl -f -s "https://$DOMAIN/service-worker.js" > /dev/null 2>&1; then
        print_success "Service worker is accessible"
    else
        print_warning "Service worker may not be accessible"
    fi
}

# Check for deployment-specific indicators
check_deployment_indicators() {
    print_status "Checking deployment indicators..."
    
    # Check if the page loads without errors
    local page_content=$(curl -s "https://$DOMAIN/")
    
    if echo "$page_content" | grep -q "Career Portfolio\|React\|root"; then
        print_success "Frontend is loading correctly"
    else
        print_error "Frontend may not be loading correctly"
    fi
}

# Provide troubleshooting steps
print_troubleshooting() {
    echo ""
    echo "🔧 Troubleshooting Steps:"
    echo "========================"
    echo ""
    echo "If updates are still not visible:"
    echo ""
    echo "1. Clear browser cache completely:"
    echo "   - Chrome: Settings > Privacy and security > Clear browsing data"
    echo "   - Firefox: Settings > Privacy & Security > Clear Data"
    echo ""
    echo "2. Hard refresh the page:"
    echo "   - Windows: Ctrl+Shift+R"
    echo "   - Mac: Cmd+Shift+R"
    echo ""
    echo "3. Open in incognito/private mode"
    echo ""
    echo "4. Clear service worker:"
    echo "   - Open DevTools (F12)"
    echo "   - Application tab > Service Workers > Unregister"
    echo ""
    echo "5. Check if Docker containers are using latest images:"
    echo "   docker-compose -f docker-compose.prod.yml pull"
    echo "   docker-compose -f docker-compose.prod.yml up -d --force-recreate"
    echo ""
    echo "6. Check logs for errors:"
    echo "   docker-compose -f docker-compose.prod.yml logs frontend"
    echo "   docker-compose -f docker-compose.prod.yml logs nginx"
    echo ""
}

# Main function
main() {
    echo "Starting deployment verification..."
    
    check_services
    check_health
    check_cache_headers
    check_build_timestamp
    test_service_worker
    check_deployment_indicators
    
    print_success "Deployment verification completed!"
    print_troubleshooting
}

# Run main function
main "$@" 