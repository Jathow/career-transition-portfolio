import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Code as CodeIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { brandConfig } from '../../config/brand';
import BrandedLogo from './BrandedLogo';
import BrandedButton from './BrandedButton';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'secondary' | 'success' | 'info';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const colors = brandConfig.colors;
  
  const getColorStyles = () => {
    switch (color) {
      case 'secondary':
        return { color: colors.secondary.main };
      case 'success':
        return { color: colors.success.main };
      case 'info':
        return { color: colors.info.main };
      default:
        return { color: colors.primary.main };
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: brandConfig.shadows.xl,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            '& .MuiSvgIcon-root': {
              fontSize: '3rem',
              ...getColorStyles(),
            },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: brandConfig.typography.fontWeight.semiBold,
            mb: 1,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const BrandedLanding: React.FC = () => {
  const navigate = useNavigate();
  const colors = brandConfig.colors;

  const features = [
    {
      icon: <CodeIcon />,
      title: 'Project Management',
      description: 'Plan and track portfolio projects with time constraints and progress visualization.',
      color: 'primary' as const,
    },
    {
      icon: <DescriptionIcon />,
      title: 'Resume Builder',
      description: 'Generate professional resumes tailored to different job applications with multiple formats.',
      color: 'secondary' as const,
    },
    {
      icon: <WorkIcon />,
      title: 'Application Tracking',
      description: 'Track job applications, follow-ups, and interview scheduling with status management.',
      color: 'success' as const,
    },
    {
      icon: <AssignmentIcon />,
      title: 'Interview Prep',
      description: 'Prepare for technical interviews with company research and question banks.',
      color: 'info' as const,
    },
    {
      icon: <VisibilityIcon />,
      title: 'Portfolio Showcase',
      description: 'Create professional project showcases with live demos and documentation.',
      color: 'primary' as const,
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Progress Tracking',
      description: 'Monitor daily activities, set goals, and maintain motivation throughout your journey.',
      color: 'secondary' as const,
    },
  ];

  const stats = [
    { label: 'Unlimited Projects', value: '∞' },
    { label: 'Complete Tracking', value: '100%' },
    { label: 'Resume Templates', value: '5+' },
    { label: 'Open Source', value: 'MIT' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
          color: '#ffffff',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <BrandedLogo
                    variant="full"
                    size="large"
                    color="inherit"
                    sx={{ mb: 3 }}
                  />
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: brandConfig.typography.fontWeight.bold,
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Build Your Future,
                    <br />
                    One Project at a Time
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      fontWeight: brandConfig.typography.fontWeight.medium,
                      lineHeight: 1.5,
                    }}
                  >
                    A comprehensive platform for career-transitioning developers to build, 
                    track, and showcase portfolio projects while managing their entire job search process.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                  >
                    <BrandedButton
                      variant="primary"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        bgcolor: '#ffffff',
                        color: colors.primary.main,
                        '&:hover': {
                          bgcolor: '#f8f9fa',
                        },
                      }}
                    >
                      Get Started Free
                    </BrandedButton>
                    <BrandedButton
                      variant="outline"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        borderColor: '#ffffff',
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: '#ffffff',
                          color: colors.primary.main,
                        },
                      }}
                    >
                      Sign In
                    </BrandedButton>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 400,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: brandConfig.radius.xl,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#ff5f56', 
                        mr: 1 
                      }} />
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#ffbd2e', 
                        mr: 1 
                      }} />
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: '#27ca3f' 
                      }} />
                      <Typography variant="caption" sx={{ ml: 2, opacity: 0.8 }}>
                        Career Portfolio Dashboard
                      </Typography>
                    </Box>

                    {/* Dashboard Content */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Stats Row */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ 
                          flex: 1, 
                          height: 40, 
                          background: 'rgba(255, 255, 255, 0.2)', 
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                            Projects
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                            12
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          height: 40, 
                          background: 'rgba(255, 255, 255, 0.2)', 
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                            Applications
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                            47
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          height: 40, 
                          background: 'rgba(255, 255, 255, 0.2)', 
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                            Interviews
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                            8
                          </Typography>
                        </Box>
                      </Box>

                      {/* Project List */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, mb: 1, display: 'block' }}>
                          Recent Projects
                        </Typography>
                        {[
                          { name: 'E-commerce Platform', progress: 85, status: 'In Progress' },
                          { name: 'Task Management App', progress: 100, status: 'Completed' },
                          { name: 'Weather Dashboard', progress: 60, status: 'In Progress' }
                        ].map((project, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1.5,
                            p: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1
                          }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                                {project.name}
                              </Typography>
                              <Box sx={{ 
                                width: '100%', 
                                height: 4, 
                                background: 'rgba(255, 255, 255, 0.2)', 
                                borderRadius: 2,
                                mt: 0.5
                              }}>
                                <Box sx={{ 
                                  width: `${project.progress}%`, 
                                  height: '100%', 
                                  background: project.progress === 100 ? '#4caf50' : '#2196f3',
                                  borderRadius: 2
                                }} />
                              </Box>
                            </Box>
                            <Typography variant="caption" sx={{ 
                              opacity: 0.8, 
                              ml: 1, 
                              fontSize: '0.7rem',
                              color: project.progress === 100 ? '#4caf50' : '#2196f3'
                            }}>
                              {project.progress}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Bottom Action */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        pt: 1,
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                          Built with React • Node.js • TypeScript
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: brandConfig.typography.fontWeight.bold,
                    color: colors.primary.main,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: brandConfig.typography.fontWeight.medium,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: brandConfig.typography.fontWeight.bold,
              mb: 2,
            }}
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontWeight: brandConfig.typography.fontWeight.medium,
            }}
          >
            From project planning to interview preparation, we've got you covered 
            with tools designed specifically for career-transitioning developers.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: colors.grey[50],
          py: 8,
          borderTop: `1px solid ${colors.grey[200]}`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: brandConfig.typography.fontWeight.bold,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Ready to Transform Your Career?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontWeight: brandConfig.typography.fontWeight.medium,
              }}
            >
              Join thousands of developers who have successfully transitioned their careers 
              using our comprehensive platform.
            </Typography>
            <BrandedButton
              variant="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Start Your Journey Today
            </BrandedButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default BrandedLanding; 