import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '../types';
import { config } from '../utils/config';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token if available
  client.interceptors.request.use(
    config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor - handle common response patterns
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => response,
    error => {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500,
        details: error.response?.data?.details || {},
      };
      
      // Handle common HTTP errors
      if (apiError.statusCode === 401) {
        localStorage.removeItem('authToken');
        // Redirect to login or emit logout event
      }
      
      return Promise.reject(apiError);
    }
  );

  return client;
};

// API client instance
export const apiClient = createApiClient();

// Generic API functions
export const api = {
  get: <T>(url: string) => 
    apiClient.get<ApiResponse<T>>(url).then(response => response.data),
  
  post: <T>(url: string, data?: any) => 
    apiClient.post<ApiResponse<T>>(url, data).then(response => response.data),
  
  put: <T>(url: string, data?: any) => 
    apiClient.put<ApiResponse<T>>(url, data).then(response => response.data),
  
  delete: <T>(url: string) => 
    apiClient.delete<ApiResponse<T>>(url).then(response => response.data),
  
  patch: <T>(url: string, data?: any) => 
    apiClient.patch<ApiResponse<T>>(url, data).then(response => response.data),
}; 