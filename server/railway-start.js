#!/usr/bin/env node

console.log('=== Railway Startup Debug ===');
console.log('Time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const masked = url.length > 70
    ? url.substring(0, 50) + '...' + url.substring(url.length - 20)
    : url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
} else {
  console.log('❌ DATABASE_URL is empty or undefined');
}

// Check if dist directory and index.js exist
const fs = require('fs');
const path = require('path');
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');
console.log('Checking build files...');
console.log('dist directory exists:', fs.existsSync(distPath));
console.log('index.js exists:', fs.existsSync(indexPath));

// Check client build
const clientBuildPath = path.join(__dirname, '../client/build');
const clientIndexPath = path.join(clientBuildPath, 'index.html');
console.log('Checking client build...');
console.log('client/build directory exists:', fs.existsSync(clientBuildPath));
console.log('client/build/index.html exists:', fs.existsSync(clientIndexPath));

if (fs.existsSync(clientBuildPath)) {
  console.log('Files in client/build:');
  try {
    const files = fs.readdirSync(clientBuildPath);
    files.forEach(file => console.log('  -', file));
  } catch (error) {
    console.log('Error reading client/build:', error.message);
  }
}

if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory does not exist. Build may have failed.');
  process.exit(1);
}
if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.js does not exist. Build may have failed.');
  process.exit(1);
}
console.log('✅ Build files found');

console.log('=== Starting Application ===');
try {
  // Start the actual application
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Failed to start application:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 