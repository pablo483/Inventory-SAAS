import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Tenant {
  id: number;
  tenantId: string;
  companyName: string;
  email: string;
  subscriptionPlan: 'BASIC' | 'INTERMEDIATE' | 'ENTERPRISE';
  isActive: boolean;
  createdAt: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get<any>('/api/super-admin/tenants');
      return response.data?.content || response.data || [];
    },
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create the tenant and admin transactionally
      const tenantRes = await api.post('/api/super-admin/tenant-with-admin', {
        companyName: data.companyName,
        companyEmail: data.companyEmail,
        subscriptionPlan: data.subscriptionPlan,
        adminUsername: data.adminUsername,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        adminPhone: data.adminPhone,
      });
      
      return tenantRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}
