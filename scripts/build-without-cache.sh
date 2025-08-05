#!/bin/bash

# Build script that handles cache issues
# This script builds the application without relying on problematic cache mounts

set -e

echo "🔨 Building Career Portfolio without cache dependencies..."

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
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Clean Docker cache
clean_docker_cache() {
    print_status "Cleaning Docker cache..."
    
    # Remove all unused containers, networks, images
    docker system prune -f
    
    # Clean build cache
    docker builder prune -f
    
    # Remove node_modules cache if it exists
    if [ -d "client/node_modules/.cache" ]; then
        rm -rf client/node_modules/.cache
    fi
    
    if [ -d "server/node_modules/.cache" ]; then
        rm -rf server/node_modules/.cache
    fi
    
    print_success "Docker cache cleaned"
}

# Build client without cache
build_client() {
    print_status "Building client application..."
    
    cd client
    
    # Clean npm cache
    npm cache clean --force
    
    # Remove node_modules if it exists
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # Install dependencies
    npm ci --cache /tmp/.npm --prefer-offline --no-audit
    
    # Build the application
    DISABLE_ESLINT_PLUGIN=true npm run build
    
    cd ..
    
    print_success "Client build completed"
}

# Build server without cache
build_server() {
    print_status "Building server application..."
    
    cd server
    
    # Clean npm cache
    npm cache clean --force
    
    # Remove node_modules if it exists
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # Install dependencies
    npm ci --cache /tmp/.npm --prefer-offline --no-audit
    
    # Generate Prisma client
    npx prisma generate
    
    # Build the application
    npm run build
    
    cd ..
    
    print_success "Server build completed"
}

# Build Docker images without cache
build_docker_images() {
    print_status "Building Docker images without cache..."
    
    # Build client image
    docker build --no-cache -f client/Dockerfile -t career-portfolio-client:latest ./client
    
    # Build server image
    docker build --no-cache -f server/Dockerfile -t career-portfolio-server:latest ./server
    
    print_success "Docker images built successfully"
}

# Test the build
test_build() {
    print_status "Testing the build..."
    
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
    
    print_success "Build test passed"
}

# Main function
main() {
    echo "Starting build process..."
    
    check_prerequisites
    clean_docker_cache
    build_client
    build_server
    build_docker_images
    test_build
    
    print_success "Build completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Deploy using: docker-compose -f docker-compose.prod.yml up -d"
    echo "2. Or deploy to Railway: git push origin main"
    echo "3. Check logs: docker-compose -f docker-compose.prod.yml logs"
    echo ""
}

# Run main function
main "$@" 