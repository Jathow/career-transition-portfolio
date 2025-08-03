import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  LinearProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import cacheService from '../../services/cacheService';

interface PerformanceMetrics {
  pageLoadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  apiResponseTime: number;
  bundleSize: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    bundleSize: 0,
  });
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('show-performance-monitor') === 'true') {
      setIsVisible(true);
      measurePerformance();
    }
  }, []);

  const measurePerformance = () => {
    // Measure page load time
    const pageLoadTime = performance.now();

    // Measure memory usage (if available)
    const memoryUsage = (performance as any).memory 
      ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
      : 0;

    // Get cache statistics
    const cacheStats = cacheService.getStats();
    const cacheHitRate = cacheStats.memorySize > 0 ? 85 : 0; // Mock value

    // Measure API response time (mock)
    const apiResponseTime = 150; // ms

    // Bundle size (mock)
    const bundleSize = 2.5; // MB

    setMetrics({
      pageLoadTime: Math.round(pageLoadTime),
      memoryUsage,
      cacheHitRate,
      apiResponseTime,
      bundleSize,
    });
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'success';
    if (value <= threshold) return 'warning';
    return 'error';
  };

  const getPerformanceLabel = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'Excellent';
    if (value <= threshold) return 'Good';
    return 'Poor';
  };

  if (!isVisible) return null;

  return (
    <Card sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000, 
      maxWidth: 300,
      backgroundColor: 'background.paper',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Performance
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Quick overview */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip
            label={`${metrics.pageLoadTime}ms`}
            size="small"
            color={getPerformanceColor(metrics.pageLoadTime, 1000)}
            variant="outlined"
          />
          <Chip
            label={`${metrics.memoryUsage}MB`}
            size="small"
            color={getPerformanceColor(metrics.memoryUsage, 100)}
            variant="outlined"
          />
        </Box>

        {/* Detailed metrics */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 1 }}>
            {/* Page Load Time */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Page Load</Typography>
                <Typography variant="caption">
                  {getPerformanceLabel(metrics.pageLoadTime, 1000)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.pageLoadTime / 1000) * 100, 100)}
                color={getPerformanceColor(metrics.pageLoadTime, 1000)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>

            {/* Memory Usage */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Memory</Typography>
                <Typography variant="caption">
                  {getPerformanceLabel(metrics.memoryUsage, 100)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.memoryUsage / 100) * 100, 100)}
                color={getPerformanceColor(metrics.memoryUsage, 100)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>

            {/* Cache Hit Rate */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Cache Hit Rate</Typography>
                <Typography variant="caption">
                  {getPerformanceLabel(metrics.cacheHitRate, 80)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.cacheHitRate}
                color={getPerformanceColor(100 - metrics.cacheHitRate, 20)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>

            {/* API Response Time */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">API Response</Typography>
                <Typography variant="caption">
                  {getPerformanceLabel(metrics.apiResponseTime, 200)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.apiResponseTime / 200) * 100, 100)}
                color={getPerformanceColor(metrics.apiResponseTime, 200)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>

            {/* Bundle Size */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Bundle Size</Typography>
                <Typography variant="caption">
                  {getPerformanceLabel(metrics.bundleSize, 3)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.bundleSize / 3) * 100, 100)}
                color={getPerformanceColor(metrics.bundleSize, 3)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Tooltip title="Refresh metrics">
                <IconButton
                  size="small"
                  onClick={measurePerformance}
                  sx={{ fontSize: 12 }}
                >
                  <SpeedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear cache">
                <IconButton
                  size="small"
                  onClick={() => {
                    cacheService.clear();
                    measurePerformance();
                  }}
                  sx={{ fontSize: 12 }}
                >
                  <StorageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor; 