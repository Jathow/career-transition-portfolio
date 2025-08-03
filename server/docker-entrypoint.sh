#!/bin/sh

# Docker entrypoint script for production
# This script runs on container startup to initialize the database and start the application

set -e

echo "🐳 Starting Career Transition Portfolio Backend..."

# Check if this is the first run (database doesn't exist)
if [ ! -f /app/prisma/prod.db ]; then
    echo "🔧 First run detected - initializing database..."
    
    # Run as root to set up database permissions
    if [ "$(id -u)" = "0" ]; then
        # We're running as root, set up the database
        /app/scripts/init-database.sh
        
        # Switch to nodejs user and continue setup
        echo "👤 Switching to nodejs user for application startup..."
        exec su -s /bin/sh nodejs -c "cd /app && npx ts-node src/index.ts"
    else
        # We're already running as nodejs user
        echo "⚠️ Running as non-root user, database may need manual initialization"
    fi
else
    echo "✅ Database exists, starting application..."
fi

# Start the application
echo "🚀 Starting Node.js application..."
exec npx ts-node src/index.ts