import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Chip,
} from '@mui/material';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  content: React.ReactNode;
}

interface SimpleTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

const SimpleTabs: React.FC<SimpleTabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <Box>
      {/* Tab Navigation */}
      <Paper sx={{ p: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'contained' : 'outlined'}
              startIcon={tab.icon}
              sx={{
                flex: 1,
                py: 1.5,
                textTransform: 'none',
                position: 'relative',
                '&:hover': {
                  backgroundColor: activeTab === tab.id ? 'primary.dark' : 'action.hover',
                }
              }}
            >
              {tab.label}
              {tab.count && (
                <Chip
                  label={tab.count}
                  size="small"
                  color="error"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-label': {
                      px: 0.5
                    }
                  }}
                />
              )}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTabData?.content}
      </Box>
    </Box>
  );
};

export default SimpleTabs;