import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { brandConfig } from '../../config/brand';
import BrandedLogo from './BrandedLogo';

interface BrandedEmailTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  footerText?: string;
  isDarkMode?: boolean;
}

const BrandedEmailTemplate: React.FC<BrandedEmailTemplateProps> = ({
  title,
  subtitle,
  children,
  ctaText,
  ctaLink,
  footerText,
  isDarkMode = false,
}) => {
  const colors = brandConfig.colors;
  const bgColor = isDarkMode ? colors.grey[900] : colors.grey[50];
  const textColor = isDarkMode ? colors.grey[100] : colors.grey[800];
  const borderColor = isDarkMode ? colors.grey[700] : colors.grey[200];

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: bgColor,
        fontFamily: brandConfig.typography.fontFamily.primary,
        color: textColor,
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: brandConfig.spacing.lg,
          textAlign: 'center',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <BrandedLogo
          variant="full"
          size="medium"
          color="primary"
          sx={{ mb: 2 }}
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: brandConfig.typography.fontWeight.bold,
            color: colors.primary.main,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: isDarkMode ? colors.grey[400] : colors.grey[600],
              fontWeight: brandConfig.typography.fontWeight.medium,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          padding: brandConfig.spacing.lg,
          backgroundColor: isDarkMode ? colors.grey[800] : '#ffffff',
        }}
      >
        <Box sx={{ color: textColor }}>
          {children}
        </Box>

        {/* CTA Button */}
        {ctaText && ctaLink && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              href={ctaLink}
              sx={{
                backgroundColor: colors.primary.main,
                color: colors.primary.contrastText,
                borderRadius: brandConfig.radius.md,
                fontWeight: brandConfig.typography.fontWeight.semiBold,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: colors.primary.dark,
                },
              }}
            >
              {ctaText}
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: brandConfig.spacing.lg,
          backgroundColor: isDarkMode ? colors.grey[900] : colors.grey[100],
          textAlign: 'center',
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? colors.grey[400] : colors.grey[600],
            mb: 2,
          }}
        >
          {footerText || 'Thank you for using Career Portfolio'}
        </Typography>
        <Divider sx={{ mb: 2, borderColor }} />
        <Typography
          variant="caption"
          sx={{
            color: isDarkMode ? colors.grey[500] : colors.grey[500],
            display: 'block',
          }}
        >
          © {new Date().getFullYear()} Career Portfolio. All rights reserved.
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isDarkMode ? colors.grey[500] : colors.grey[500],
            display: 'block',
            mt: 1,
          }}
        >
          This email was sent to you as part of your Career Portfolio account.
        </Typography>
      </Box>
    </Box>
  );
};

// Specific email templates
export const WelcomeEmailTemplate: React.FC<{ userName: string }> = ({ userName }) => (
  <BrandedEmailTemplate
    title="Welcome to Career Portfolio!"
    subtitle="Your journey to a successful career transition starts here"
    ctaText="Get Started"
    ctaLink="/dashboard"
    footerText="We're excited to help you build your future, one project at a time."
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: brandConfig.typography.fontWeight.semiBold }}>
      Hi {userName},
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Welcome to Career Portfolio! We're thrilled to have you on board. You now have access to a comprehensive 
      platform designed specifically for career-transitioning developers like yourself.
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Here's what you can do with Career Portfolio:
    </Typography>
    <Box component="ul" sx={{ pl: 3, mb: 2 }}>
      <li>Plan and track portfolio projects with time constraints</li>
      <li>Generate professional resumes tailored to different positions</li>
      <li>Track job applications and interview preparation</li>
      <li>Create stunning portfolio showcases</li>
      <li>Monitor your progress and stay motivated</li>
    </Box>
    <Typography variant="body1">
      Ready to start building your future? Click the button below to access your dashboard and begin your journey.
    </Typography>
  </BrandedEmailTemplate>
);

export const ProjectReminderEmailTemplate: React.FC<{ 
  userName: string; 
  projectName: string; 
  daysRemaining: number;
  projectLink: string;
}> = ({ userName, projectName, daysRemaining, projectLink }) => (
  <BrandedEmailTemplate
    title="Project Deadline Reminder"
    subtitle={`Your project "${projectName}" is due soon`}
    ctaText="View Project"
    ctaLink={projectLink}
    footerText="Stay on track with your career goals!"
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: brandConfig.typography.fontWeight.semiBold }}>
      Hi {userName},
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      This is a friendly reminder that your project <strong>"{projectName}"</strong> is due in{' '}
      <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Remember, consistent progress on your portfolio projects is key to a successful career transition. 
      Take some time today to work on this project and keep moving forward toward your goals.
    </Typography>
    <Typography variant="body1">
      Click the button below to view your project details and continue your work.
    </Typography>
  </BrandedEmailTemplate>
);

export const InterviewReminderEmailTemplate: React.FC<{
  userName: string;
  companyName: string;
  position: string;
  interviewDate: string;
  interviewLink?: string;
}> = ({ userName, companyName, position, interviewDate, interviewLink }) => (
  <BrandedEmailTemplate
    title="Upcoming Interview Reminder"
    subtitle={`Interview with ${companyName} for ${position}`}
    ctaText={interviewLink ? "Join Interview" : "View Details"}
    ctaLink={interviewLink || "/interviews"}
    footerText="Good luck with your interview!"
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: brandConfig.typography.fontWeight.semiBold }}>
      Hi {userName},
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      This is a reminder that you have an upcoming interview with <strong>{companyName}</strong> for the{' '}
      <strong>{position}</strong> position on <strong>{interviewDate}</strong>.
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Make sure you've prepared by:
    </Typography>
    <Box component="ul" sx={{ pl: 3, mb: 2 }}>
      <li>Reviewing the company's recent news and updates</li>
      <li>Practicing common technical questions</li>
      <li>Preparing thoughtful questions to ask the interviewer</li>
      <li>Testing your interview setup if it's virtual</li>
    </Box>
    <Typography variant="body1">
      You've got this! Your preparation and portfolio work have positioned you well for this opportunity.
    </Typography>
  </BrandedEmailTemplate>
);

export default BrandedEmailTemplate; 