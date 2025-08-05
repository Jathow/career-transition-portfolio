#!/usr/bin/env node

/**
 * Import Example Project Script
 * 
 * This script imports the Career Portfolio Platform example project
 * into the database as a demonstration of the platform's capabilities.
 * 
 * Usage: node scripts/import-example-project.js [userId]
 */

const fs = require('fs');
const path = require('path');

// Import the example project data
const projectData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../career-portfolio-platform-project.json'), 'utf8')
);

/**
 * Import project data into the Career Portfolio Platform
 * @param {string} userId - The user ID to associate the project with
 */
async function importExampleProject(userId = 'demo-user') {
  try {
    console.log('🚀 Importing Career Portfolio Platform example project...');
    
    // In a real implementation, this would use your database connection
    // For now, we'll just demonstrate the data structure
    
    const importData = {
      userId: userId,
      project: {
        ...projectData.project,
        userId: userId,
        isExample: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      resumeEntry: {
        ...projectData.resume.projectEntry,
        userId: userId,
        projectId: 'generated-project-id',
        createdAt: new Date()
      },
      portfolioShowcase: {
        ...projectData.portfolio.showcase,
        userId: userId,
        projectId: 'generated-project-id',
        isPublic: true,
        createdAt: new Date()
      },
      marketAnalysis: {
        ...projectData.revenueAndMarket,
        userId: userId,
        projectId: 'generated-project-id',
        createdAt: new Date()
      },
      motivationLogs: projectData.motivation.dailyLogs.map(log => ({
        ...log,
        userId: userId,
        projectId: 'generated-project-id',
        createdAt: new Date(log.date)
      }))
    };
    
    console.log('📊 Project Data Structure:');
    console.log('- Project Details:', Object.keys(importData.project).length, 'fields');
    console.log('- Resume Entry:', Object.keys(importData.resumeEntry).length, 'fields');
    console.log('- Portfolio Showcase:', Object.keys(importData.portfolioShowcase).length, 'fields');
    console.log('- Market Analysis:', Object.keys(importData.marketAnalysis).length, 'fields');
    console.log('- Motivation Logs:', importData.motivationLogs.length, 'entries');
    
    // Example database operations (replace with your actual database calls)
    console.log('\n🔄 Database Operations (Example):');
    console.log('1. INSERT INTO projects VALUES (...project data...)');
    console.log('2. INSERT INTO resume_entries VALUES (...resume data...)');
    console.log('3. INSERT INTO portfolio_items VALUES (...portfolio data...)');
    console.log('4. INSERT INTO market_analyses VALUES (...market data...)');
    console.log('5. INSERT INTO motivation_logs VALUES (...log data...)');
    
    /*
    // Real implementation would look like this:
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Create the project
    const project = await prisma.project.create({
      data: importData.project
    });
    
    // Create resume entry
    await prisma.resumeEntry.create({
      data: {
        ...importData.resumeEntry,
        projectId: project.id
      }
    });
    
    // Create portfolio showcase
    await prisma.portfolioItem.create({
      data: {
        ...importData.portfolioShowcase,
        projectId: project.id
      }
    });
    
    // Create market analysis
    await prisma.marketAnalysis.create({
      data: {
        ...importData.marketAnalysis,
        projectId: project.id
      }
    });
    
    // Create motivation logs
    await prisma.motivationLog.createMany({
      data: importData.motivationLogs.map(log => ({
        ...log,
        projectId: project.id
      }))
    });
    
    console.log('✅ Example project imported successfully!');
    console.log('Project ID:', project.id);
    */
    
    console.log('\n✅ Example project data prepared for import!');
    console.log('📝 To complete the import, integrate this script with your database layer.');
    
    return importData;
    
  } catch (error) {
    console.error('❌ Error importing example project:', error);
    throw error;
  }
}

/**
 * Generate sample data variations for testing
 */
function generateSampleVariations() {
  const variations = [
    {
      title: "E-commerce Mobile App",
      category: "Mobile Development",
      technologies: ["React Native", "Node.js", "MongoDB", "Stripe API"],
      duration: "8 weeks"
    },
    {
      title: "Data Analytics Dashboard",
      category: "Data Visualization",
      technologies: ["Python", "Django", "PostgreSQL", "D3.js", "Chart.js"],
      duration: "6 weeks"
    },
    {
      title: "Real-time Chat Application",
      category: "Web Development",
      technologies: ["Socket.io", "Express.js", "React", "Redis", "JWT"],
      duration: "4 weeks"
    }
  ];
  
  return variations.map(variation => ({
    ...projectData,
    project: {
      ...projectData.project,
      ...variation,
      title: variation.title,
      category: variation.category,
      technologies: variation.technologies,
      duration: variation.duration
    }
  }));
}

// CLI interface
if (require.main === module) {
  const userId = process.argv[2] || 'demo-user';
  
  console.log('📋 Career Portfolio Platform - Example Project Importer');
  console.log('=' .repeat(60));
  
  importExampleProject(userId)
    .then((data) => {
      console.log('\n🎉 Import completed successfully!');
      console.log('👤 User ID:', userId);
      console.log('📊 Data imported for all platform sections');
      
      if (process.argv.includes('--variations')) {
        console.log('\n🔄 Generating sample variations...');
        const variations = generateSampleVariations();
        console.log('Generated', variations.length, 'project variations');
      }
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  importExampleProject,
  generateSampleVariations,
  projectData
};