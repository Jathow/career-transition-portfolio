#!/usr/bin/env node

console.log('=== Creating Admin User ===');
console.log('Time:', new Date().toISOString());

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Admin Email:', adminEmail);
    console.log('Admin Password:', adminPassword ? '***SET***' : 'NOT SET');

    if (!adminEmail || !adminPassword) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log(`✅ Updated existing user ${adminEmail} to ADMIN role`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      });
      console.log(`✅ Created new admin user: ${adminEmail}`);
    }

    console.log('🎉 Admin setup complete!');
    console.log('You can now login with:', adminEmail);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 