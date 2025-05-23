import { useQuery, useMutation } from '@tanstack/react-query';
import { demoService } from '../services/demoService';
import type { ApiError } from '../types';

// Simple hook to check API health
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: demoService.getHealthCheck,
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });
};

// Hook to get greeting from API
export const useGreeting = (name?: string) => {
  return useQuery({
    queryKey: ['greeting', name],
    queryFn: () => demoService.getGreeting(name),
    enabled: true,
  });
};

// Hook to send echo message
export const useEcho = () => {
  return useMutation({
    mutationFn: demoService.echo,
    onError: (error: ApiError) => {
      console.error('Echo failed:', error.message);
    },
  });
}; 