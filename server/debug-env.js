#!/usr/bin/env node

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql:'));
console.log('DATABASE_URL starts with postgres:', process.env.DATABASE_URL?.startsWith('postgres:'));

if (process.env.DATABASE_URL) {
  // Mask the password for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', maskedUrl);
} else {
  console.log('DATABASE_URL is empty or undefined');
}

console.log('All environment variables starting with DATABASE:');
Object.keys(process.env)
  .filter(key => key.toUpperCase().includes('DATABASE'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  });

console.log('=== End Debug ==='); 