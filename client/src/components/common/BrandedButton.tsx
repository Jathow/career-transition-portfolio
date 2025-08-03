import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { brandConfig } from '../../config/brand';

interface BrandedButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const BrandedButton: React.FC<BrandedButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  children,
  disabled,
  sx = {},
  ...props
}) => {
  const getVariantStyles = () => {
    const colors = brandConfig.colors;
    
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrastText,
          '&:hover': {
            backgroundColor: colors.secondary.dark,
            boxShadow: brandConfig.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            backgroundColor: colors.grey[300],
            color: colors.grey[500],
          },
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary.main,
          border: `2px solid ${colors.primary.main}`,
          '&:hover': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            boxShadow: brandConfig.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            borderColor: colors.grey[300],
            color: colors.grey[500],
          },
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            boxShadow: brandConfig.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            color: colors.grey[500],
          },
        };
      case 'danger':
        return {
          backgroundColor: colors.error.main,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: colors.error.dark,
            boxShadow: brandConfig.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            backgroundColor: colors.grey[300],
            color: colors.grey[500],
          },
        };
      default:
        return {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          '&:hover': {
            backgroundColor: colors.primary.dark,
            boxShadow: brandConfig.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            backgroundColor: colors.grey[300],
            color: colors.grey[500],
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 16px',
          fontSize: brandConfig.typography.fontSize.sm,
          minHeight: '32px',
        };
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: brandConfig.typography.fontSize.lg,
          minHeight: '48px',
        };
      default:
        return {
          padding: '8px 20px',
          fontSize: brandConfig.typography.fontSize.base,
          minHeight: '40px',
        };
    }
  };

  return (
    <Button
      variant="contained"
      disabled={disabled || loading}
      sx={{
        borderRadius: brandConfig.radius.md,
        fontWeight: brandConfig.typography.fontWeight.semiBold,
        textTransform: 'none',
        boxShadow: brandConfig.shadows.sm,
        transition: 'all 0.2s ease-in-out',
        '&:active': {
          transform: 'translateY(0)',
        },
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...sx,
      }}
      startIcon={
        loading ? (
          <CircularProgress
            size={16}
            color="inherit"
            sx={{ color: 'inherit' }}
          />
        ) : (
          icon
        )
      }
      {...props}
    >
      {children}
    </Button>
  );
};

export default BrandedButton; 