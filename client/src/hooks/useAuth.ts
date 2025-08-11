import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User, LoginInput } from '@shared/schema';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      return await apiRequest('POST', '/api/auth/login', data);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['/api/auth/user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
  });
}



export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
    },
  });
}