#!/usr/bin/env node

console.log('=== Railway Service Check ===');
console.log('Time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check all Railway-related environment variables
console.log('\n=== Railway Environment Variables ===');
Object.keys(process.env).forEach(key => {
  if (key.includes('RAILWAY') || key.includes('DATABASE') || key.includes('POSTGRES')) {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  }
});

// Check if we have the DATABASE_URL
console.log('\n=== Database URL Check ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL length:', url.length);
  console.log('Starts with postgresql:', url.startsWith('postgresql'));
  console.log('Contains railway.internal:', url.includes('railway.internal'));
  
  // Show masked version
  const masked = url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
} else {
  console.log('❌ DATABASE_URL is not set');
}

// Try to connect with different approaches
console.log('\n=== Testing Connection Approaches ===');

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.errorCode);
    
    // Provide specific troubleshooting steps
    if (error.errorCode === 'P1001') {
      console.log('\n🔧 Troubleshooting P1001 (Can\'t reach database):');
      console.log('1. Check if PostgreSQL service is running in Railway');
      console.log('2. Verify services are in the same project');
      console.log('3. Try connecting services manually in Railway dashboard');
      console.log('4. Check if DATABASE_URL uses correct hostname');
    }
  }
}

testConnection(); 