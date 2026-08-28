import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface GlobalMetrics {
  totalTenants: number;
  totalActiveTenants: number;
  inactiveTenants: number;
  tenantsByPlan: Record<string, number>;
  totalAdmins: number;
  totalUsers: number;
  totalRegularUsers: number;
  totalProducts: number;
  totalSuppliers: number;
  totalCategories: number;
  totalApiCalls: number;
  totalStorageUsed: number;
  totalSystemSales: number;
  totalSystemInventoryValue: number;
  newTenantsThisMonth: number;
  newUsersThisMonths: number;
  totalStockTransactions: number;
}

export function useGlobalMetrics() {
  return useQuery({
    queryKey: ['globalMetrics'],
    queryFn: async () => {
      const response = await api.get<GlobalMetrics>('/api/super-admin/metrics/global');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
