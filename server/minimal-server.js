#!/usr/bin/env node

const http = require('http');

console.log('=== Minimal Server Starting ===');
console.log('Time:', new Date().toISOString());
console.log('PID:', process.pid);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Create server immediately
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Minimal server running');
  }
});

const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

// Keep alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => process.exit(0));
}); 