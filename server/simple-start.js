#!/usr/bin/env node

console.log('=== Simple Railway Startup ===');
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

// Check if src exists
if (fs.existsSync('./src')) {
  console.log('src directory exists');
  console.log('Files in src:');
  fs.readdirSync('./src').forEach(file => {
    console.log('  -', file);
  });
} else {
  console.log('src directory does not exist');
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

console.log('=== End Debug ===');

// Keep the process alive for a bit to see logs
setTimeout(() => {
  console.log('Exiting after 10 seconds...');
  process.exit(0);
}, 10000); 