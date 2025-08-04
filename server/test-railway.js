#!/usr/bin/env node

console.log('=== Railway Environment Test ===');
console.log('Time:', new Date().toISOString());
console.log('Current directory:', process.cwd());
console.log('Process ID:', process.pid);
console.log('Node version:', process.version);
console.log('Platform:', process.platform);

// List all files recursively
const fs = require('fs');
const path = require('path');

function listFiles(dir, indent = '') {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`${indent}📁 ${file}/`);
        listFiles(fullPath, indent + '  ');
      } else {
        console.log(`${indent}📄 ${file}`);
      }
    });
  } catch (error) {
    console.log(`${indent}❌ Error reading ${dir}:`, error.message);
  }
}

console.log('\n=== File Structure ===');
listFiles('.');

console.log('\n=== Environment Variables ===');
Object.keys(process.env).forEach(key => {
  if (key.includes('RAILWAY') || key.includes('PORT') || key.includes('NODE')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

console.log('\n=== Starting Simple Server ===');

const http = require('http');
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server running');
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Test server listening on port ${port}`);
});

// Keep running
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
}); 