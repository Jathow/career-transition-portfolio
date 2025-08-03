import React from 'react';
import { Card, CardProps, Box, Typography } from '@mui/material';
import { brandConfig } from '../../config/brand';

interface BrandedCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const BrandedCard: React.FC<BrandedCardProps> = ({
  variant = 'default',
  title,
  subtitle,
  action,
  children,
  sx = {},
  ...props
}) => {
  const getVariantStyles = () => {
    const colors = brandConfig.colors;
    
    switch (variant) {
      case 'elevated':
        return {
          boxShadow: brandConfig.shadows.lg,
          '&:hover': {
            boxShadow: brandConfig.shadows.xl,
            transform: 'translateY(-2px)',
          },
        };
      case 'outlined':
        return {
          boxShadow: 'none',
          border: `1px solid ${colors.grey[200]}`,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
          color: '#ffffff',
          '& .MuiTypography-root': {
            color: '#ffffff',
          },
        };
      default:
        return {
          boxShadow: brandConfig.shadows.md,
          '&:hover': {
            boxShadow: brandConfig.shadows.lg,
          },
        };
    }
  };

  return (
    <Card
      sx={{
        borderRadius: brandConfig.radius.lg,
        padding: brandConfig.spacing.lg,
        transition: 'all 0.3s ease-in-out',
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: brandConfig.spacing.md,
            gap: brandConfig.spacing.sm,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: brandConfig.typography.fontWeight.semiBold,
                  marginBottom: subtitle ? brandConfig.spacing.xs : 0,
                  color: variant === 'gradient' ? '#ffffff' : 'text.primary',
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                  fontWeight: brandConfig.typography.fontWeight.medium,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && (
            <Box sx={{ flexShrink: 0 }}>
              {action}
            </Box>
          )}
        </Box>
      )}
      <Box>
        {children}
      </Box>
    </Card>
  );
};

export default BrandedCard; 