import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Image from './LazyImage';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => {
  return (
    <Box textAlign="center" py={3} px={2}>
      <Box sx={{ maxWidth: 360, mx: 'auto', mb: 1.5 }}>
        <Image src="/favicon-emoji.svg" alt="Empty state" height={120} effect="opacity" />
      </Box>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} size="small">
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;


