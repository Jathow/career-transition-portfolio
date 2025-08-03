const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Demo user data
const demoUsers = [
  {
    email: 'demo@careerportfolio.com',
    password: 'DemoPass123!',
    firstName: 'Alex',
    lastName: 'Johnson',
    targetJobTitle: 'Full Stack Developer',
    jobSearchDeadline: new Date('2024-03-01'),
    role: 'USER'
  },
  {
    email: 'admin@careerportfolio.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    targetJobTitle: 'System Administrator',
    jobSearchDeadline: new Date('2024-06-01'),
    role: 'ADMIN'
  }
];

// Demo projects
const demoProjects = [
  {
    title: 'E-commerce Platform',
    description: 'A full-stack e-commerce application built with React, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, payment processing with Stripe, and admin dashboard.',
    techStack: 'React, Node.js, PostgreSQL, Stripe, Redux, Material-UI',
    startDate: new Date('2024-01-01'),
    targetEndDate: new Date('2024-01-08'),
    actualEndDate: new Date('2024-01-07'),
    status: 'completed',
    repositoryUrl: 'https://github.com/demo/ecommerce-platform',
    liveUrl: 'https://ecommerce-demo.vercel.app',
    revenueTracking: true,
    marketResearch: 'Competitive analysis shows opportunity in small business e-commerce solutions'
  },
  {
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates, team collaboration, and project tracking. Built with React, Socket.io, and MongoDB.',
    techStack: 'React, Socket.io, MongoDB, Express, JWT, Tailwind CSS',
    startDate: new Date('2024-01-10'),
    targetEndDate: new Date('2024-01-17'),
    actualEndDate: new Date('2024-01-16'),
    status: 'completed',
    repositoryUrl: 'https://github.com/demo/task-manager',
    liveUrl: 'https://task-manager-demo.netlify.app',
    revenueTracking: false
  },
  {
    title: 'Weather Dashboard',
    description: 'A weather dashboard application that displays current weather and forecasts using OpenWeatherMap API. Features include location-based weather, 7-day forecast, and weather alerts.',
    techStack: 'React, TypeScript, OpenWeatherMap API, Chart.js, CSS Grid',
    startDate: new Date('2024-01-20'),
    targetEndDate: new Date('2024-01-27'),
    status: 'in-progress',
    repositoryUrl: 'https://github.com/demo/weather-dashboard',
    liveUrl: 'https://weather-demo.vercel.app',
    revenueTracking: false
  },
  {
    title: 'Portfolio Website',
    description: 'A responsive portfolio website showcasing projects and skills. Built with modern web technologies and optimized for performance and SEO.',
    techStack: 'React, Next.js, TypeScript, Tailwind CSS, Framer Motion',
    startDate: new Date('2024-01-30'),
    targetEndDate: new Date('2024-02-06'),
    status: 'planning',
    repositoryUrl: 'https://github.com/demo/portfolio-website',
    revenueTracking: false
  }
];

// Demo job applications
const demoApplications = [
  {
    companyName: 'TechCorp Inc.',
    jobTitle: 'Senior Full Stack Developer',
    jobUrl: 'https://techcorp.com/careers/senior-developer',
    applicationDate: new Date('2024-01-05'),
    status: 'interview',
    coverLetter: 'Dear Hiring Manager, I am excited to apply for the Senior Full Stack Developer position at TechCorp...',
    notes: 'Applied through LinkedIn, hiring manager is Sarah Johnson. Technical interview scheduled for next week.'
  },
  {
    companyName: 'StartupXYZ',
    jobTitle: 'Frontend Developer',
    jobUrl: 'https://startupxyz.com/jobs/frontend-developer',
    applicationDate: new Date('2024-01-08'),
    status: 'screening',
    notes: 'Applied through company website. Received email for initial screening call.'
  },
  {
    companyName: 'Enterprise Solutions',
    jobTitle: 'Full Stack Engineer',
    jobUrl: 'https://enterprisesolutions.com/careers/full-stack-engineer',
    applicationDate: new Date('2024-01-12'),
    status: 'applied',
    notes: 'Applied through Indeed. Waiting for response.'
  },
  {
    companyName: 'Innovation Labs',
    jobTitle: 'React Developer',
    jobUrl: 'https://innovationlabs.com/jobs/react-developer',
    applicationDate: new Date('2024-01-15'),
    status: 'rejected',
    notes: 'Received rejection email. Feedback: Need more experience with TypeScript and testing.'
  }
];

// Demo interviews
const demoInterviews = [
  {
    interviewType: 'technical',
    scheduledDate: new Date('2024-01-20T14:00:00Z'),
    duration: 60,
    interviewerName: 'Sarah Johnson',
    preparationNotes: 'Focus on system design, React patterns, and database optimization. Review e-commerce project thoroughly.',
    outcome: 'pending'
  },
  {
    interviewType: 'phone',
    scheduledDate: new Date('2024-01-18T10:00:00Z'),
    duration: 30,
    interviewerName: 'Mike Chen',
    preparationNotes: 'Prepare for behavioral questions and discuss previous projects. Have questions ready about company culture.',
    outcome: 'passed'
  }
];

// Demo resumes
const demoResumes = [
  {
    versionName: 'Full Stack Developer - Tech Companies',
    templateId: 'modern',
    isDefault: true,
    content: {
      personalInfo: {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexjohnson',
        github: 'github.com/alexjohnson'
      },
      summary: 'Full-stack developer with 3+ years of experience building scalable web applications. Passionate about clean code, user experience, and continuous learning. Proven track record of delivering projects on time and collaborating effectively with cross-functional teams.',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Previous Tech Company',
          startDate: '2022-01-01',
          endDate: '2023-12-31',
          description: 'Developed and maintained web applications using React, Node.js, and PostgreSQL. Collaborated with design and product teams to implement new features. Mentored junior developers and conducted code reviews.'
        }
      ],
      projects: [
        {
          title: 'E-commerce Platform',
          description: 'Full-stack e-commerce application with payment processing, user authentication, and admin dashboard.',
          techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
          url: 'https://github.com/demo/ecommerce-platform'
        },
        {
          title: 'Task Management App',
          description: 'Collaborative task management application with real-time updates and team collaboration.',
          techStack: ['React', 'Socket.io', 'MongoDB', 'Express'],
          url: 'https://github.com/demo/task-manager'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Express', 'Git', 'Docker', 'AWS'],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'University of Technology',
          graduationYear: 2021
        }
      ]
    }
  }
];

// Demo activities
const demoActivities = [
  {
    type: 'coding',
    description: 'Implemented user authentication system for e-commerce project',
    duration: 180,
    timestamp: new Date('2024-01-02T10:00:00Z')
  },
  {
    type: 'coding',
    description: 'Added payment processing with Stripe integration',
    duration: 240,
    timestamp: new Date('2024-01-03T14:00:00Z')
  },
  {
    type: 'applications',
    description: 'Applied to 5 job positions',
    duration: 60,
    timestamp: new Date('2024-01-05T09:00:00Z')
  },
  {
    type: 'learning',
    description: 'Completed TypeScript course on Udemy',
    duration: 120,
    timestamp: new Date('2024-01-06T16:00:00Z')
  },
  {
    type: 'interview_prep',
    description: 'Practiced system design questions',
    duration: 90,
    timestamp: new Date('2024-01-07T11:00:00Z')
  }
];

// Demo goals
const demoGoals = [
  {
    title: 'Complete 3 portfolio projects',
    target: 3,
    current: 2,
    deadline: new Date('2024-01-31'),
    type: 'project_completion'
  },
  {
    title: 'Apply to 20 companies',
    target: 20,
    current: 8,
    deadline: new Date('2024-02-28'),
    type: 'application_submission'
  },
  {
    title: 'Complete 5 technical interviews',
    target: 5,
    current: 1,
    deadline: new Date('2024-03-31'),
    type: 'interview_performance'
  }
];

async function createDemoData() {
  try {
    console.log('Creating demo data...');
    
    // Create demo users (or get existing ones)
    const createdUsers = [];
    for (const userData of demoUsers) {
      let user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            targetJobTitle: userData.targetJobTitle,
            jobSearchDeadline: userData.jobSearchDeadline
          }
        });
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
      createdUsers.push(user);
    }

    const demoUser = createdUsers[0];

    // Create demo projects
    const createdProjects = [];
    for (const projectData of demoProjects) {
      const project = await prisma.project.create({
        data: {
          ...projectData,
          userId: demoUser.id
        }
      });
      createdProjects.push(project);
      console.log(`Created project: ${project.title}`);
    }

    // Create demo resumes
    for (const resumeData of demoResumes) {
      const resume = await prisma.resume.create({
        data: {
          ...resumeData,
          content: JSON.stringify(resumeData.content),
          userId: demoUser.id
        }
      });
      console.log(`Created resume: ${resume.versionName}`);
    }

    // Create demo job applications
    for (const applicationData of demoApplications) {
      const application = await prisma.jobApplication.create({
        data: {
          ...applicationData,
          userId: demoUser.id,
          resumeVersionId: (await prisma.resume.findFirst({ where: { userId: demoUser.id } })).id
        }
      });
      console.log(`Created application: ${application.jobTitle} at ${application.companyName}`);
    }

    // Create demo interviews
    for (const interviewData of demoInterviews) {
      const interview = await prisma.interview.create({
        data: {
          ...interviewData,
          applicationId: (await prisma.jobApplication.findFirst({ where: { userId: demoUser.id } })).id
        }
      });
      console.log(`Created interview: ${interview.interviewType} interview`);
    }

    // Create demo activities
    for (const activityData of demoActivities) {
      const activity = await prisma.dailyActivity.create({
        data: {
          ...activityData,
          userId: demoUser.id
        }
      });
      console.log(`Created activity: ${activity.description}`);
    }

    // Create demo goals
    for (const goalData of demoGoals) {
      const goal = await prisma.goal.create({
        data: {
          ...goalData,
          userId: demoUser.id
        }
      });
      console.log(`Created goal: ${goal.title}`);
    }

    // Create demo portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: demoUser.id,
        title: 'Alex Johnson - Full Stack Developer',
        subtitle: 'Building scalable web applications',
        description: 'Passionate full-stack developer with expertise in modern web technologies. Focused on creating user-friendly applications that solve real-world problems.',
        theme: 'professional',
        isPublic: true,
        seoTitle: 'Alex Johnson - Full Stack Developer Portfolio',
        seoDescription: 'Portfolio showcasing full-stack development projects and skills',
        seoKeywords: 'full-stack, developer, react, node.js, portfolio, web development'
      }
    });
    console.log(`Created portfolio: ${portfolio.title}`);

    // Create demo notifications
    const notifications = [
      {
        userId: demoUser.id,
        type: 'deadline',
        title: 'Project Deadline Approaching',
        message: 'Your E-commerce Platform project deadline is in 2 days. Make sure to complete all remaining tasks.',
        priority: 'high'
      },
      {
        userId: demoUser.id,
        type: 'milestone',
        title: 'Milestone Achieved!',
        message: 'Congratulations! You have completed 2 projects this month.',
        priority: 'medium'
      },
      {
        userId: demoUser.id,
        type: 'interview',
        title: 'Interview Reminder',
        message: 'You have a technical interview with TechCorp Inc. tomorrow at 2:00 PM.',
        priority: 'high'
      }
    ];

    for (const notificationData of notifications) {
      const notification = await prisma.notification.create({
        data: notificationData
      });
      console.log(`Created notification: ${notification.title}`);
    }

    console.log('Demo data created successfully!');
    console.log('\nDemo Account Credentials:');
    console.log('Email: demo@careerportfolio.com');
    console.log('Password: DemoPass123!');
    console.log('\nAdmin Account Credentials:');
    console.log('Email: admin@careerportfolio.com');
    console.log('Password: AdminPass123!');

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createDemoData();
}

module.exports = { createDemoData }; 