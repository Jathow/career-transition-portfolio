interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache (both memory and localStorage)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Set in memory cache
    this.memoryCache.set(key, item);

    // Set in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data;
    }

    // Try localStorage
    try {
      const storedItem = localStorage.getItem(key);
      if (storedItem) {
        const item: CacheItem<T> = JSON.parse(storedItem);
        if (!this.isExpired(item)) {
          // Update memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Remove expired item
          this.remove(key);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }

    return null;
  }

  /**
   * Remove an item from cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      // Clear only our cached items (with specific prefix)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Check if an item is expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Get cache statistics
   */
  getStats(): { memorySize: number; localStorageSize: number } {
    let localStorageSize = 0;
    try {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith('cache_')).length;
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
    };
  }

  /**
   * Preload data for better performance
   */
  async preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Cache API responses with automatic key generation
   */
  async cacheApiResponse<T>(
    url: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = `api_${btoa(url)}`;
    return this.preload(cacheKey, fetchFn, ttl);
  }
}

// Create a singleton instance
const cacheService = new CacheService();

export default cacheService; 