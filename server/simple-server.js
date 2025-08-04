#!/usr/bin/env node

const http = require('http');

console.log('=== Simple HTTP Server ===');
console.log('Time:', new Date().toISOString());
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

// List files in current directory
const fs = require('fs');
console.log('Files in current directory:');
fs.readdirSync('.').forEach(file => {
  console.log('  -', file);
});

// Check if dist exists
if (fs.existsSync('./dist')) {
  console.log('dist directory exists');
  console.log('Files in dist:');
  fs.readdirSync('./dist').forEach(file => {
    console.log('  -', file);
  });
} else {
  console.log('dist directory does not exist');
}

console.log('=== Environment Variables ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const masked = url.length > 70 
    ? url.substring(0, 50) + '...' + url.substring(url.length - 20)
    : url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      message: 'Simple server is running'
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Simple server is running');
  }
});

const port = process.env.PORT || 3000;

// Start server immediately
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Simple server listening on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 