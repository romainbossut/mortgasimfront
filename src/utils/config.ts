import type { AppConfig } from '../types';

// Environment variable validation
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = import.meta.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

// App configuration
export const config: AppConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  appName: getEnvVar('VITE_APP_NAME', 'React App'),
  version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  environment: getEnvVar('VITE_ENV', 'development'),
};

// Check if we're in development mode
export const isDevelopment = config.environment === 'development';

// Check if we're in production mode
export const isProduction = config.environment === 'production'; 