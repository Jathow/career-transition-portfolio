import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UpgradeCTAProps {
  compact?: boolean;
}

const UpgradeCTA: React.FC<UpgradeCTAProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  return (
    <Alert
      severity="info"
      sx={{
        py: compact ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
      }}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" variant="outlined" onClick={() => navigate('/pricing')}>
            View pricing
          </Button>
        </Stack>
      }
    >
      Unlock higher limits and PRO features by upgrading your plan.
    </Alert>
  );
};

export default UpgradeCTA;


