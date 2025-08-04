#!/usr/bin/env node

console.log('=== Railway Startup Debug ===');
console.log('Time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

if (process.env.DATABASE_URL) {
  // Show first 50 chars and last 20 chars for security
  const url = process.env.DATABASE_URL;
  const masked = url.length > 70 
    ? url.substring(0, 50) + '...' + url.substring(url.length - 20)
    : url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
} else {
  console.log('❌ DATABASE_URL is empty or undefined');
}

console.log('=== Starting Application ===');

// Start the actual application
require('./dist/index.js'); 