import type { HealthCheck } from '../types';
import { api } from './api';

export const demoService = {
  // Health check endpoint
  getHealthCheck: () => api.get<HealthCheck>('/health'),
  
  // Simple greeting endpoint
  getGreeting: (name?: string) => 
    api.get<{ message: string }>(`/greeting${name ? `?name=${name}` : ''}`),
  
  // Echo endpoint - sends back what you send
  echo: (message: string) => 
    api.post<{ echo: string }>('/echo', { message }),
}; 