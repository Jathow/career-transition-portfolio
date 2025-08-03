// Simple error logging utility for frontend
export const logger = {
  error: (message: string, error?: any) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}:`, error);
    }
    // In production, you could send to an error tracking service
    // like Sentry, LogRocket, etc.
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}:`, data);
    }
  },
  
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}:`, data);
    }
  }
}; 