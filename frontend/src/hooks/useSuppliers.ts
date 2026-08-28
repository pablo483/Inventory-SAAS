import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Supplier {
  id: number;
  name: string;
  tenantId: string;
  phone: string;
  contactEmail: string;
  address: string;
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

export function useSuppliers(page = 0, size = 20) {
  return useQuery({
    queryKey: ['suppliers', page, size],
    queryFn: async () => {
      const response = await api.get<PageResponse<Supplier>>(`/api/suppliers?page=${page}&size=${size}`);
      return response.data;
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; phone?: string; contactEmail?: string; address?: string }) => {
      const response = await api.post('/api/suppliers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; phone?: string; contactEmail?: string; address?: string } }) => {
      const response = await api.put(`/api/suppliers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
