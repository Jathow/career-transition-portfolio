#!/usr/bin/env node

/**
 * Build script for Career Transition Portfolio
 * Prepares the application for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Career Transition Portfolio for deployment...\n');

try {
  // Step 1: Install client dependencies and build
  console.log('📦 Building client application...');
  execSync('cd client && npm ci && npm run build', { stdio: 'inherit' });
  console.log('✅ Client build completed\n');

  // Step 2: Install server dependencies and build
  console.log('🔧 Building server application...');
  execSync('cd server && npm ci && npm run build', { stdio: 'inherit' });
  console.log('✅ Server build completed\n');

  // Step 3: Generate Prisma client
  console.log('🗄️ Generating database client...');
  execSync('cd server && npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Database client generated\n');

  // Step 4: Create production package.json
  console.log('📄 Creating production configuration...');
  const productionPackage = {
    name: 'career-transition-portfolio',
    version: '1.0.0',
    description: 'Career Transition Portfolio - Production Build',
    main: 'server/dist/index.js',
    scripts: {
      start: 'cd server && node dist/index.js',
      'db:migrate': 'cd server && npx prisma migrate deploy',
      'db:seed': 'cd server && node scripts/setupUser.js'
    },
    engines: {
      node: '>=18.0.0'
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(productionPackage, null, 2));
  console.log('✅ Production configuration created\n');

  console.log('🎉 Build completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy to your chosen platform (Railway, AWS, etc.)');
  console.log('2. Set up environment variables');
  console.log('3. Run database migrations');
  console.log('4. Your app will be live!\n');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}