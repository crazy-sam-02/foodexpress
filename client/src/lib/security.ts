/**
 * Security and performance utilities
 */

// Remove console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Add security headers for production
export const addSecurityHeaders = (app: any) => {
  if (import.meta.env.PROD) {
    // Set security headers
    app.use((req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
  }
};

// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting helper
export const createRateLimiter = (requests: number, windowMs: number) => {
  const attempts = new Map();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!attempts.has(identifier)) {
      attempts.set(identifier, []);
    }
    
    const userAttempts = attempts.get(identifier);
    const recentAttempts = userAttempts.filter((time: number) => time > windowStart);
    
    if (recentAttempts.length >= requests) {
      return false;
    }
    
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    
    return true;
  };
};