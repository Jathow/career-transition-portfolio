import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';

import { brandConfig } from '../../config/brand';

interface BrandedLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  onClick?: () => void;
  sx?: any;
}

const BrandedLogo: React.FC<BrandedLogoProps> = ({
  variant = 'full',
  size = 'medium',
  color = 'primary',
  onClick,
  sx = {},
}) => {
  const brandColors = brandConfig.colors;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: '1rem', gap: 1 };
      case 'large':
        return { fontSize: '1.5rem', gap: 1.5 };
      default:
        return { fontSize: '1.25rem', gap: 1.25 };
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'secondary':
        return { color: brandColors.secondary.main };
      case 'inherit':
        return { color: 'inherit' };
      default:
        return { color: brandColors.primary.main };
    }
  };

  const LogoIcon = () => (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '28%',
        background: 'conic-gradient(from 180deg at 50% 50%, #60a5fa, #a78bfa, #60a5fa)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '46%', height: '46%', borderRadius: '18%', backgroundColor: 'white', opacity: 0.95 }} />
    </Box>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <LogoIcon />;
      case 'compact':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LogoIcon />
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: brandConfig.typography.fontWeight.semiBold,
                ...getColorStyles(),
              }}
            >
              CP
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogoIcon />
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  margin: 0,
                  padding: 0,
                  background: 'linear-gradient(135deg, #c7d2fe, #93c5fd, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {brandConfig.name}
              </Typography>
              <Typography
                variant="caption"
                component="div"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  lineHeight: 1.1,
                  margin: 0,
                  padding: 0,
                  fontWeight: brandConfig.typography.fontWeight.medium,
                }}
              >
                {brandConfig.tagline}
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 0.2s ease-in-out',
        '&:hover': onClick ? { opacity: 0.8 } : {},
        height: '100%',
        minHeight: '48px',
        ...getSizeStyles(),
        ...sx,
      }}
      onClick={onClick}
    >
      {renderLogo()}
    </Box>
  );
};

export default BrandedLogo; 