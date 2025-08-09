import React from 'react';
import { Box } from '@mui/material';

// A subtle animated aurora/gradient backdrop for dark theme
// Renders behind all content; pointer-events disabled
const AuroraBackground: React.FC = () => {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        '& .blob': {
          position: 'absolute',
          filter: 'blur(60px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
          animation: 'float 18s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(-10%) rotate(0deg)' },
          '50%': { transform: 'translateY(10%) rotate(10deg)' },
        },
      }}
    >
      <Box
        className="blob"
        sx={{
          width: 520,
          height: 520,
          left: '-10%',
          top: '-10%',
          background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.5), rgba(59,130,246,0) 60%)',
          animationDelay: '0s',
        }}
      />
      <Box
        className="blob"
        sx={{
          width: 600,
          height: 600,
          right: '-15%',
          top: '-10%',
          background: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.45), rgba(139,92,246,0) 60%)',
          animationDelay: '3s',
        }}
      />
      <Box
        className="blob"
        sx={{
          width: 680,
          height: 680,
          left: '20%',
          bottom: '-20%',
          background: 'radial-gradient(circle at 40% 70%, rgba(16,185,129,0.35), rgba(16,185,129,0) 60%)',
          animationDelay: '6s',
        }}
      />
      <Box
        className="blob"
        sx={{
          width: 520,
          height: 520,
          right: '10%',
          bottom: '-15%',
          background: 'radial-gradient(circle at 60% 70%, rgba(245,158,11,0.3), rgba(245,158,11,0) 60%)',
          animationDelay: '9s',
        }}
      />
    </Box>
  );
};

export default AuroraBackground;


