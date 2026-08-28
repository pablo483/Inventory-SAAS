import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface User {
  id: number;
  tenantId: string;
  username: string;
  email: string;
  phone: string | null;
  role: 'TENANT_ADMIN' | 'TENANT_USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export function useTenantUsers(page = 0, size = 20, searchTerm = '') {
  return useQuery({
    queryKey: ['tenantUsers', page, size, searchTerm],
    queryFn: async () => {
      let url = `/api/tenant/users?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      const response = await api.get<PageResponse<User>>(url);
      return response.data;
    },
  });
}

export function useCreateTenantUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<User> & { password?: string }) => {
      const response = await api.post('/api/tenant/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantUsers'] });
    },
  });
}

export function useUpdateTenantUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const response = await api.put(`/api/tenant/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantUsers'] });
    },
  });
}

export function useDeleteTenantUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/tenant/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantUsers'] });
    },
  });
}
