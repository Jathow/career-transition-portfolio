#!/bin/bash

# Railway optimization script to reduce image size
set -e

echo "🔧 Optimizing for Railway deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Remove development dependencies and files after build
cleanup_after_build() {
    print_status "Cleaning up development files..."
    
    # Remove source files after build
    if [ -d "client/src" ]; then
        rm -rf client/src
    fi
    
    if [ -d "server/src" ]; then
        rm -rf server/src
    fi
    
    # Remove test files
    find . -name "*.test.*" -type f -delete 2>/dev/null || true
    find . -name "*.spec.*" -type f -delete 2>/dev/null || true
    find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove documentation
    find . -name "*.md" -not -path "./node_modules/*" -delete 2>/dev/null || true
    find . -name "docs" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove development configs
    find . -name "*.config.js" -not -path "./node_modules/*" -delete 2>/dev/null || true
    find . -name "*.config.ts" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    print_success "Development files cleaned"
}

# Clean up Prisma engines (keep only the needed one)
cleanup_prisma_engines() {
    print_status "Cleaning up Prisma engines..."
    
    # Find Prisma directories
    find . -path "*/node_modules/@prisma/engines" -type d | while read -r dir; do
        if [ -d "$dir" ]; then
            # Keep only linux-musl engine for Railway
            find "$dir" -name "*windows*" -delete 2>/dev/null || true
            find "$dir" -name "*darwin*" -delete 2>/dev/null || true
            find "$dir" -name "*debian*" -delete 2>/dev/null || true
            find "$dir" -name "*rhel*" -delete 2>/dev/null || true
            find "$dir" -name "*arm64*" -delete 2>/dev/null || true
        fi
    done
    
    print_success "Prisma engines cleaned"
}

# Remove unnecessary node_modules
cleanup_node_modules() {
    print_status "Cleaning up node_modules..."
    
    # Remove common large development dependencies
    find . -path "*/node_modules" -type d | while read -r nm_dir; do
        if [ -d "$nm_dir" ]; then
            # Remove large dev dependencies
            rm -rf "$nm_dir"/@types/* 2>/dev/null || true
            rm -rf "$nm_dir"/typescript 2>/dev/null || true
            rm -rf "$nm_dir"/eslint* 2>/dev/null || true
            rm -rf "$nm_dir"/prettier 2>/dev/null || true
            rm -rf "$nm_dir"/jest* 2>/dev/null || true
            rm -rf "$nm_dir"/cypress 2>/dev/null || true
            rm -rf "$nm_dir"/@testing-library 2>/dev/null || true
            rm -rf "$nm_dir"/webpack* 2>/dev/null || true
            rm -rf "$nm_dir"/@babel 2>/dev/null || true
            
            # Remove source maps and documentation
            find "$nm_dir" -name "*.map" -delete 2>/dev/null || true
            find "$nm_dir" -name "*.md" -delete 2>/dev/null || true
            find "$nm_dir" -name "CHANGELOG*" -delete 2>/dev/null || true
            find "$nm_dir" -name "LICENSE*" -delete 2>/dev/null || true
            find "$nm_dir" -name "README*" -delete 2>/dev/null || true
            find "$nm_dir" -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true
            find "$nm_dir" -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
            find "$nm_dir" -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
            find "$nm_dir" -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
        fi
    done
    
    print_success "node_modules cleaned"
}

# Main cleanup function
main() {
    cleanup_after_build
    cleanup_prisma_engines
    cleanup_node_modules
    
    print_success "Railway optimization completed!"
    
    # Show size reduction
    echo ""
    echo "📊 Optimization complete. Image should be significantly smaller now."
}

main "$@"