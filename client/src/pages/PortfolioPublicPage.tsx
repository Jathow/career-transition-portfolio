import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchPublicPortfolio, fetchPublicPortfolioContent } from '../store/slices/portfolioSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PortfolioPreview from '../components/portfolio/PortfolioPreview';

const PortfolioPublicPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const { publicPortfolio, publicContent, loading, error } = useAppSelector((s) => s.portfolio);

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchPublicPortfolio(userId));
    dispatch(fetchPublicPortfolioContent(userId));
  }, [dispatch, userId]);

  if (loading && !publicPortfolio && !publicContent) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!publicPortfolio) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="warning">Portfolio not found or not public.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box>
        <PortfolioPreview contentOverride={publicContent} hideControls />
      </Box>
    </Container>
  );
};

export default PortfolioPublicPage;

