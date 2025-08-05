# Deployment Troubleshooting Guide

## Issue: UI Updates Not Appearing After Deployment

If you've successfully deployed updates but they're not appearing in the frontend, this guide will help you identify and resolve the issue.

## Root Causes

The most common causes for UI updates not appearing are:

1. **Service Worker Caching** - The service worker is serving cached content
2. **Nginx Static Asset Caching** - Static assets are cached for 1 year
3. **Browser Caching** - Browser is serving cached content
4. **Docker Build Cache** - Docker is using cached layers
5. **CDN Caching** - If using a CDN, it may be caching content

## Quick Fixes

### 1. Clear All Caches (Recommended)

Run the cache clearing script:

```bash
./scripts/clear-cache.sh
```

This script will:
- Clear Docker build cache
- Reload nginx configuration
- Clear Redis cache
- Restart frontend and nginx services
- Add cache busting headers

### 2. Force Browser Cache Clear

**Hard Refresh:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Clear Browser Cache:**
- Chrome: Settings > Privacy and security > Clear browsing data
- Firefox: Settings > Privacy & Security > Clear Data
- Safari: Develop > Empty Caches

**Incognito/Private Mode:**
Open the application in incognito/private mode to bypass cache.

### 3. Clear Service Worker

1. Open DevTools (F12)
2. Go to Application tab
3. Service Workers > Unregister
4. Refresh the page

## Detailed Solutions

### Service Worker Issues

The service worker has been updated to:
- Use dynamic cache names based on timestamp
- Skip caching for API requests
- Force immediate activation
- Clear old caches automatically

**Manual Fix:**
```bash
# Update service worker cache name
sed -i 's/career-portfolio-v1/career-portfolio-v'$(date +%s)'/g' client/public/service-worker.js
```

### Nginx Caching Issues

The nginx configuration has been updated to:
- Reduce static asset cache from 1 year to 1 hour
- Add `must-revalidate` instead of `immutable`
- Exclude service worker from caching
- Add cache busting headers

**Manual Fix:**
```bash
# Update nginx config
sed -i 's/expires 1y/expires 1h/g' nginx/nginx.prod.conf
sed -i 's/immutable/must-revalidate/g' nginx/nginx.prod.conf
```

### Docker Build Cache Issues

**Force rebuild without cache:**
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

**Clear all Docker cache:**
```bash
docker system prune -f --volumes
docker builder prune -f
```

### Redis Cache Issues

**Clear Redis cache:**
```bash
docker exec $(docker ps -q --filter "name=redis") redis-cli FLUSHALL
```

## Verification

### Check Deployment Status

Run the verification script:

```bash
./scripts/verify-deployment.sh
```

This will check:
- Service health
- Cache headers
- Build timestamps
- Service worker accessibility

### Manual Verification

1. **Check Service Status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

2. **Check Logs:**
```bash
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

3. **Check Cache Headers:**
```bash
curl -I https://your-domain.com/static/js/main.js
```

4. **Check Service Worker:**
```bash
curl -I https://your-domain.com/service-worker.js
```

## Prevention

### 1. Update Deployment Script

The deployment script now includes automatic cache clearing:

```bash
# In deploy-production.sh
./scripts/clear-cache.sh
```

### 2. Use Cache Busting

Add version parameters to static assets:

```javascript
// In service worker registration
const swUrl = `${process.env.PUBLIC_URL!}/service-worker.js?v=${Date.now()}`;
```

### 3. Monitor Cache Headers

Regularly check that cache headers are appropriate:

```bash
curl -I https://your-domain.com/static/js/main.js | grep -i cache
```

## Common Error Messages

### "Service worker not updating"
- Clear service worker in DevTools
- Check if service worker file is accessible
- Verify cache headers

### "Static assets cached"
- Check nginx configuration
- Clear browser cache
- Verify cache headers

### "Docker using old images"
- Force rebuild without cache
- Check image timestamps
- Pull latest images

## Environment-Specific Issues

### Railway Deployment

If deploying to Railway, ensure:
- Build cache is cleared
- Environment variables are set correctly
- Health checks are passing

### Local Development

For local development:
- Use `npm run dev` instead of production build
- Disable service worker in development
- Clear browser cache regularly

## Support

If issues persist:

1. Check the logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify configuration files
3. Test in incognito mode
4. Check network tab in DevTools for failed requests

## Files Modified

The following files have been updated to fix caching issues:

- `client/public/service-worker.js` - Dynamic cache names
- `client/src/serviceWorker.ts` - Force updates
- `nginx/nginx.prod.conf` - Reduced caching
- `client/nginx.conf` - Reduced caching
- `scripts/clear-cache.sh` - Cache clearing script
- `scripts/verify-deployment.sh` - Verification script
- `deploy-production.sh` - Added cache clearing

## Testing Checklist

After making changes:

- [ ] Clear browser cache
- [ ] Hard refresh page
- [ ] Check in incognito mode
- [ ] Verify service worker is updated
- [ ] Check cache headers
- [ ] Test API endpoints
- [ ] Verify static assets load
- [ ] Check for console errors 