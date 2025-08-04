#!/usr/bin/env node

console.log('=== Railway Environment Test ===');
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

// Check for other database-related variables
const dbVars = Object.keys(process.env).filter(key => 
  key.toUpperCase().includes('DATABASE') || 
  key.toUpperCase().includes('DB_') ||
  key.toUpperCase().includes('POSTGRES')
);

console.log('Database-related environment variables:');
dbVars.forEach(key => {
  const value = process.env[key];
  console.log(`  ${key}: ${value ? 'SET (' + value.length + ' chars)' : 'NOT SET'}`);
});

if (dbVars.length === 0) {
  console.log('  No database-related variables found');
}

console.log('=== End Test ==='); 