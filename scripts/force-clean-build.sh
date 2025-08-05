#!/bin/bash

echo "🧹 Force clean build - clearing all caches..."

# Remove all node_modules
echo "Removing node_modules..."
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules

# Remove all build artifacts
echo "Removing build artifacts..."
rm -rf client/build
rm -rf server/dist

# Remove package locks to force fresh install
echo "Removing package locks..."
rm -f package-lock.json
rm -f client/package-lock.json
rm -f server/package-lock.json

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Clean build preparation complete!"
echo "Now run: npm install && npm run build"