#!/bin/bash

# Railway-specific build script
# This script handles Railway's automatic cache mounts and build issues

set -e

echo "🚂 Building for Railway deployment..."

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
    
    print_success "All prerequisites are satisfied"
}

# Clean Railway cache issues
clean_railway_cache() {
    print_status "Cleaning Railway cache issues..."
    
    # Remove problematic cache directories
    if [ -d "client/node_modules/.cache" ]; then
        rm -rf client/node_modules/.cache
    fi
    
    if [ -d "server/node_modules/.cache" ]; then
        rm -rf server/node_modules/.cache
    fi
    
    # Clean npm cache
    npm cache clean --force
    
    print_success "Railway cache cleaned"
}

# Build client for Railway
build_client_railway() {
    print_status "Building client for Railway..."
    
    cd client
    
    # Clean npm cache
    npm cache clean --force
    
    # Remove node_modules if it exists
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # Install dependencies with Railway-compatible settings
    npm ci --cache /tmp/.npm --prefer-offline --no-audit --no-optional
    
    # Build the application
    DISABLE_ESLINT_PLUGIN=true npm run build
    
    cd ..
    
    print_success "Client build completed for Railway"
}

# Build server for Railway
build_server_railway() {
    print_status "Building server for Railway..."
    
    cd server
    
    # Clean npm cache
    npm cache clean --force
    
    # Remove node_modules if it exists
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # Install dependencies with Railway-compatible settings
    npm ci --cache /tmp/.npm --prefer-offline --no-audit --no-optional
    
    # Generate Prisma client
    npx prisma generate
    
    # Build the application
    npm run build
    
    cd ..
    
    print_success "Server build completed for Railway"
}

# Test Railway build
test_railway_build() {
    print_status "Testing Railway build..."
    
    # Check if client build exists
    if [ -d "client/build" ]; then
        print_success "Client build directory exists"
    else
        print_error "Client build directory not found"
        return 1
    fi
    
    # Check if server build exists
    if [ -d "server/dist" ]; then
        print_success "Server build directory exists"
    else
        print_error "Server build directory not found"
        return 1
    fi
    
    print_success "Railway build test passed"
}

# Create Railway-specific .dockerignore
create_railway_dockerignore() {
    print_status "Creating Railway-specific .dockerignore..."
    
    cat > .dockerignore << EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
.parcel-cache
.DS_Store
*.log
EOF

    print_success "Railway .dockerignore created"
}

# Main function
main() {
    echo "Starting Railway build process..."
    
    check_prerequisites
    clean_railway_cache
    create_railway_dockerignore
    build_client_railway
    build_server_railway
    test_railway_build
    
    print_success "Railway build completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push to Railway: git push origin main"
    echo "2. Check Railway dashboard for deployment status"
    echo "3. Monitor logs in Railway dashboard"
    echo ""
    echo "🔧 Railway-specific notes:"
    echo "- Railway automatically adds cache mounts"
    echo "- Using /tmp/.npm to avoid cache conflicts"
    echo "- Build should now work with Railway's cache system"
    echo ""
}

# Run main function
main "$@" 