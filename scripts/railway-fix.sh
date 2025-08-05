#!/bin/bash

# Railway deployment fix script
# This script addresses the cache mount conflict issue

set -e

echo "🔧 Fixing Railway deployment cache issues..."

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

# Clean any problematic cache directories
clean_cache_dirs() {
    print_status "Cleaning problematic cache directories..."
    
    # Remove any existing cache directories that might conflict
    find . -name ".cache" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    find . -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    
    print_success "Cache directories cleaned"
}

# Set npm configuration for Railway
configure_npm() {
    print_status "Configuring npm for Railway..."
    
    # Set global npm cache location
    npm config set cache /tmp/.npm
    npm config set prefer-offline true
    npm config set audit false
    npm config set optional false
    
    print_success "npm configured for Railway"
}

# Verify Railway configuration files
verify_config() {
    print_status "Verifying Railway configuration files..."
    
    # Check railway.json
    if [ -f "railway.json" ]; then
        print_success "railway.json exists"
    else
        print_error "railway.json not found"
        return 1
    fi
    
    # Check nixpacks.toml
    if [ -f "nixpacks.toml" ]; then
        print_success "nixpacks.toml exists"
    else
        print_warning "nixpacks.toml not found (optional)"
    fi
    
    # Check .railwayignore
    if [ -f ".railwayignore" ]; then
        print_success ".railwayignore exists"
    else
        print_warning ".railwayignore not found (optional)"
    fi
    
    # Check .npmrc
    if [ -f ".npmrc" ]; then
        print_success ".npmrc exists"
    else
        print_error ".npmrc not found"
        return 1
    fi
    
    print_success "Configuration files verified"
}

# Test build locally
test_build() {
    print_status "Testing build locally..."
    
    # Set npm cache
    npm config set cache /tmp/.npm
    
    # Test client build
    print_status "Testing client build..."
    cd client
    npm ci --prefer-offline --no-audit --no-optional
    DISABLE_ESLINT_PLUGIN=true npm run build
    cd ..
    
    # Test server build
    print_status "Testing server build..."
    cd server
    npm ci --prefer-offline --no-audit --no-optional
    npx prisma generate
    npm run build
    cd ..
    
    print_success "Local build test passed"
}

# Main function
main() {
    echo "Starting Railway deployment fix..."
    
    clean_cache_dirs
    configure_npm
    verify_config
    
    print_success "Railway deployment fix completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Commit and push changes: git add . && git commit -m 'Fix Railway cache issues' && git push"
    echo "2. Railway should now use Nixpacks instead of Docker"
    echo "3. Monitor deployment in Railway dashboard"
    echo ""
    echo "🔧 Changes made:"
    echo "- Created .railwayignore to prevent Docker detection"
    echo "- Created nixpacks.toml for explicit Nixpacks configuration"
    echo "- Updated railway.json with cache-safe build command"
    echo "- Configured npm to use /tmp/.npm cache location"
    echo ""
}

# Run main function
main "$@"