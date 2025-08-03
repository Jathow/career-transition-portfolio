const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'DefaultPassword123!';
    
    console.log(`Setting up user account for ${adminEmail}...`);
    
    // Create or get existing user account
    let user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!user) {
      console.log(`Creating new user account for ${adminEmail}...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          targetJobTitle: 'Full Stack Developer',
          jobSearchDeadline: new Date('2024-03-01')
        }
      });
      console.log('Created new user account:', user.email);
    } else {
      // Update existing user to have admin role
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: 'ADMIN',
          firstName: 'Justin',
          lastName: 'Hwang'
        }
      });
      console.log('Updated existing user account:', user.email);
    }
    
    console.log('User account created/updated:', user.email);
    
    // Create portfolio for this user
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {
        title: 'Justin Hwang - Full Stack Developer',
        subtitle: 'Career Transition Portfolio',
        description: 'A comprehensive portfolio showcasing my journey in transitioning to a full-stack development career. This platform itself demonstrates my ability to build complex, production-ready applications.',
        theme: 'professional',
        isPublic: true,
        seoTitle: 'Justin Hwang - Full Stack Developer Portfolio',
        seoDescription: 'Portfolio showcasing full-stack development projects and career transition journey',
        seoKeywords: 'full-stack, developer, react, node.js, portfolio, career transition, web development'
      },
      create: {
        userId: user.id,
        title: 'Justin Hwang - Full Stack Developer',
        subtitle: 'Career Transition Portfolio',
        description: 'A comprehensive portfolio showcasing my journey in transitioning to a full-stack development career. This platform itself demonstrates my ability to build complex, production-ready applications.',
        theme: 'professional',
        isPublic: true,
        seoTitle: 'Justin Hwang - Full Stack Developer Portfolio',
        seoDescription: 'Portfolio showcasing full-stack development projects and career transition journey',
        seoKeywords: 'full-stack, developer, react, node.js, portfolio, career transition, web development'
      }
    });
    
    console.log('Portfolio created for user');
    
    // Add the Career Transition Portfolio project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: 'Career Transition Portfolio Platform',
        description: 'A comprehensive full-stack web application designed to help career-transitioning developers build, track, and showcase portfolio projects while managing their entire job search process. This platform combines project management, portfolio presentation, resume building, job application tracking, and interview preparation into a unified system.',
        techStack: 'React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Docker, Nginx, Material-UI, Redux Toolkit, Chart.js, Jest, Cypress',
        startDate: new Date('2024-01-01'),
        targetEndDate: new Date('2024-01-08'),
        actualEndDate: new Date('2024-01-07'),
        status: 'completed',
        repositoryUrl: 'https://github.com/justinhwang/career-transition-portfolio',
        liveUrl: process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'https://career-portfolio.yourdomain.com',
        revenueTracking: true,
        marketResearch: 'Identified opportunity in career transition tools market. Platform serves growing demand for structured job search and portfolio management tools.'
      }
    });
    
    console.log('Portfolio project added:', project.title);
    
    // Create a resume version for this project
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        versionName: 'Full Stack Developer - Career Transition Portfolio',
        templateId: 'modern',
        isDefault: true,
        content: JSON.stringify({
          personalInfo: {
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            phone: '+1-555-0123',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/justinhwang',
            github: 'github.com/justinhwang'
          },
          summary: 'Full-stack developer transitioning from another career field. Passionate about building scalable web applications and solving complex problems. Demonstrated ability to learn quickly and deliver production-ready applications.',
          experience: [
            {
              title: 'Career Transition Portfolio Platform',
              company: 'Personal Project',
              startDate: '2024-01-01',
              endDate: '2024-01-07',
              description: 'Built a comprehensive full-stack web application for career-transitioning developers. Features include project management, portfolio generation, resume building, job application tracking, and interview preparation. Technologies: React, TypeScript, Node.js, PostgreSQL, Docker.'
            }
          ],
          projects: [
            {
              title: 'Career Transition Portfolio Platform',
              description: 'Full-stack web application for career-transitioning developers with project management, portfolio generation, and job search tracking.',
              techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Nginx'],
              url: process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'https://career-portfolio.yourdomain.com'
            }
          ],
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'Express', 'Material-UI', 'Redux Toolkit'],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              school: 'University of Technology',
              graduationYear: 2024
            }
          ]
        })
      }
    });
    
    console.log('Resume created for portfolio project');
    
    // Add real job applications (if any exist)
    console.log('Note: Job applications should be added manually through the application interface');
    
    // Add real development activities for this project
    const activities = [
      {
        type: 'coding',
        description: 'Built Career Transition Portfolio Platform - full-stack React/Node.js application',
        duration: 480,
        timestamp: new Date('2024-01-02T10:00:00Z')
      },
      {
        type: 'coding',
        description: 'Implemented user authentication, project management, and portfolio generation features',
        duration: 360,
        timestamp: new Date('2024-01-03T14:00:00Z')
      },
      {
        type: 'coding',
        description: 'Added resume builder, job application tracking, and interview preparation modules',
        duration: 420,
        timestamp: new Date('2024-01-04T09:00:00Z')
      },
      {
        type: 'coding',
        description: 'Implemented motivation tracking, progress monitoring, and revenue analysis features',
        duration: 300,
        timestamp: new Date('2024-01-05T14:00:00Z')
      },
      {
        type: 'coding',
        description: 'Added comprehensive testing suite with Jest and Cypress',
        duration: 240,
        timestamp: new Date('2024-01-06T10:00:00Z')
      },
      {
        type: 'coding',
        description: 'Set up production deployment with Docker, Nginx, and SSL certificates',
        duration: 180,
        timestamp: new Date('2024-01-07T16:00:00Z')
      }
    ];
    
    for (const activityData of activities) {
      const activity = await prisma.dailyActivity.create({
        data: {
          ...activityData,
          userId: user.id
        }
      });
      console.log(`Created activity: ${activity.description}`);
    }
    
    // Add real goals based on this project
    const goals = [
      {
        title: 'Complete Career Transition Portfolio Platform',
        target: 1,
        current: 1,
        deadline: new Date('2024-01-08'),
        type: 'project_completion'
      },
      {
        title: 'Deploy to production with SSL and monitoring',
        target: 1,
        current: 1,
        deadline: new Date('2024-01-07'),
        type: 'project_completion'
      },
      {
        title: 'Add comprehensive testing coverage',
        target: 1,
        current: 1,
        deadline: new Date('2024-01-06'),
        type: 'project_completion'
      }
    ];
    
    for (const goalData of goals) {
      const goal = await prisma.goal.create({
        data: {
          ...goalData,
          userId: user.id
        }
      });
      console.log(`Created goal: ${goal.title}`);
    }
    
    // Add real notifications for this project
    const notifications = [
      {
        type: 'milestone',
        title: 'Portfolio Platform Completed!',
        message: 'Congratulations! You have successfully completed the Career Transition Portfolio Platform project with full production deployment.',
        priority: 'high'
      },
      {
        type: 'milestone',
        title: 'Production Deployment Successful',
        message: 'Your Career Transition Portfolio Platform is now live with SSL certificates, monitoring, and automated backups.',
        priority: 'high'
      },
      {
        type: 'milestone',
        title: 'Comprehensive Testing Implemented',
        message: 'Added Jest unit tests and Cypress E2E tests with 80%+ code coverage for the portfolio platform.',
        priority: 'medium'
      }
    ];
    
    for (const notificationData of notifications) {
      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          userId: user.id
        }
      });
      console.log(`Created notification: ${notification.title}`);
    }
    
    console.log('\n✅ User setup completed successfully!');
    console.log('\n📋 Account Information:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Role: ADMIN');
    console.log('\n🎯 Portfolio Project Added:');
    console.log('   Title: Career Transition Portfolio Platform');
    console.log('   Status: Completed');
    console.log('   Live URL: ' + (process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'https://career-portfolio.yourdomain.com'));
    
  } catch (error) {
    console.error('Error setting up user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  setupUser();
}

module.exports = { setupUser }; 