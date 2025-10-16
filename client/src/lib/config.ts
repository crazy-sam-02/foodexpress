/**
 * Application configuration from environment variables
 */

export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sweet Treats Shop',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development',
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production',
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL', 'VITE_SOCKET_URL'];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar] && config.NODE_ENV === 'production') {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}

export default config;