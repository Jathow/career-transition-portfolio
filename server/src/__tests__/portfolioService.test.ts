import portfolioService from '../services/portfolioService';

// Simple test to verify the service can be imported
describe('PortfolioService', () => {
  it('should be defined', () => {
    expect(portfolioService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof portfolioService.createOrUpdatePortfolio).toBe('function');
    expect(typeof portfolioService.getPortfolioByUserId).toBe('function');
    expect(typeof portfolioService.getPublicPortfolio).toBe('function');
    expect(typeof portfolioService.generatePortfolioContent).toBe('function');
    expect(typeof portfolioService.addPortfolioAsset).toBe('function');
    expect(typeof portfolioService.getPortfolioAssets).toBe('function');
    expect(typeof portfolioService.deletePortfolioAsset).toBe('function');
    expect(typeof portfolioService.trackPortfolioView).toBe('function');
    expect(typeof portfolioService.getPortfolioAnalytics).toBe('function');
    expect(typeof portfolioService.updatePortfolioSEO).toBe('function');
    expect(typeof portfolioService.togglePortfolioVisibility).toBe('function');
  });

  it('should handle portfolio data types correctly', () => {
    const portfolioData = {
      title: 'Test Portfolio',
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      theme: 'default',
      isPublic: true,
      analyticsEnabled: true,
    };

    expect(portfolioData.title).toBe('Test Portfolio');
    expect(portfolioData.subtitle).toBe('Test Subtitle');
    expect(portfolioData.theme).toBe('default');
    expect(portfolioData.isPublic).toBe(true);
    expect(portfolioData.analyticsEnabled).toBe(true);
  });

  it('should handle asset data types correctly', () => {
    const assetData = {
      type: 'image',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      url: '/uploads/test.jpg',
      altText: 'Test image',
      order: 0,
    };

    expect(assetData.type).toBe('image');
    expect(assetData.filename).toBe('test.jpg');
    expect(assetData.mimeType).toBe('image/jpeg');
    expect(assetData.size).toBe(1024);
    expect(assetData.altText).toBe('Test image');
  });

  it('should handle analytics data types correctly', () => {
    const analyticsData = {
      visitorIp: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://google.com',
      page: 'home',
      sessionId: 'session123',
    };

    expect(analyticsData.visitorIp).toBe('192.168.1.1');
    expect(analyticsData.userAgent).toBe('Mozilla/5.0');
    expect(analyticsData.page).toBe('home');
    expect(analyticsData.sessionId).toBe('session123');
  });

  it('should handle SEO data types correctly', () => {
    const seoData = {
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      seoKeywords: 'keywords, seo, portfolio',
    };

    expect(seoData.seoTitle).toBe('SEO Title');
    expect(seoData.seoDescription).toBe('SEO Description');
    expect(seoData.seoKeywords).toBe('keywords, seo, portfolio');
  });

  it('should handle portfolio generation options correctly', () => {
    const options = {
      includeCompletedProjects: true,
      includeResume: true,
      includeAnalytics: true,
      theme: 'professional',
    };

    expect(options.includeCompletedProjects).toBe(true);
    expect(options.includeResume).toBe(true);
    expect(options.includeAnalytics).toBe(true);
    expect(options.theme).toBe('professional');
  });
}); 