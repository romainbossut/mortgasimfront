// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// App Configuration
export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  environment: string;
}

// Component Props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// API Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Simple demo data type
export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
} 