#!/bin/bash
set -e

echo "🚂 Building for Railway with Nixpacks..."

# Set npm cache to avoid conflicts
export NPM_CONFIG_CACHE=/tmp/.npm-cache
npm config set cache /tmp/.npm-cache

# Build the application
npm run build

echo "✅ Build completed successfully!"