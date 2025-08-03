#!/bin/sh

# Database initialization script for production
# This script runs as root to set up the database with proper permissions

set -e

echo "🗄️ Initializing production database..."

# Create the database directory if it doesn't exist
mkdir -p /app/prisma

# Create the database file if it doesn't exist
if [ ! -f /app/prisma/prod.db ]; then
    echo "Creating new SQLite database file..."
    touch /app/prisma/prod.db
fi

# Set proper ownership and permissions
chown -R 1001:1001 /app/prisma
chmod -R 755 /app/prisma
chmod 644 /app/prisma/prod.db

echo "✅ Database initialization completed"

# Run database migrations
echo "🔄 Running database migrations..."
su -s /bin/sh nodejs -c "cd /app && npx prisma migrate deploy"

echo "✅ Database migrations completed"

# Generate Prisma client (skip if already generated)
if [ ! -d "/app/node_modules/.prisma/client" ]; then
    echo "🔧 Generating Prisma client..."
    # Run as root to ensure permissions
    cd /app && npx prisma generate
    echo "✅ Prisma client generated"
else
    echo "✅ Prisma client already exists"
fi

echo "🎉 Database setup completed successfully!"