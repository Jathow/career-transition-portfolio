#!/bin/bash

echo "🔍 Verifying Nixpacks setup..."

# Check for Docker files that would cause Railway to use Docker
echo "Checking for Docker files..."
if find . -name "Dockerfile*" -not -path "./node_modules/*" | grep -q .; then
    echo "❌ Found Dockerfile(s) - Railway will use Docker"
    find . -name "Dockerfile*" -not -path "./node_modules/*"
else
    echo "✅ No Dockerfiles found"
fi

if find . -name "docker-compose*" -not -path "./node_modules/*" | grep -q .; then
    echo "❌ Found docker-compose files - Railway will use Docker"
    find . -name "docker-compose*" -not -path "./node_modules/*"
else
    echo "✅ No docker-compose files found"
fi

# Check for Nixpacks configuration
echo ""
echo "Checking Nixpacks configuration..."
if [ -f "nixpacks.toml" ]; then
    echo "✅ nixpacks.toml found"
else
    echo "❌ nixpacks.toml missing"
fi

if [ -f ".nixpacks/environment" ]; then
    echo "✅ .nixpacks/environment found"
else
    echo "❌ .nixpacks/environment missing"
fi

if [ -f "railway.json" ]; then
    echo "✅ railway.json found"
    if grep -q "NIXPACKS" railway.json; then
        echo "✅ railway.json specifies NIXPACKS builder"
    else
        echo "❌ railway.json doesn't specify NIXPACKS builder"
    fi
else
    echo "❌ railway.json missing"
fi

echo ""
echo "🎯 Railway should now use Nixpacks for deployment!"