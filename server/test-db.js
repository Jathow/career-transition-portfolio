#!/usr/bin/env node

console.log('=== Database Connection Test ===');
console.log('Time:', new Date().toISOString());
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const masked = url.length > 70 
    ? url.substring(0, 50) + '...' + url.substring(url.length - 20)
    : url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
}

console.log('=== Testing Database Connection ===');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    console.log('Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection(); 