import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ComponentHealth {
  status: 'UP' | 'DOWN';
  description: string;
  responseTimeMs: number;
}

export interface SystemHealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  components: Record<string, ComponentHealth>;
}

export interface LeaderBoardEntry {
  rank: number;
  tenantId: string;
  companyName: string;
  score: number;
  metrics: string;
}

export interface MyRankResponse {
  tenantId: string;
  salesRank: number;
  inventoryRank: number;
  salesScore: number;
  inventoryScore: number;
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const response = await api.get<SystemHealthResponse>('/api/super-admin/health');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useLeaderboard(metric: 'sales' | 'inventory-value' = 'sales', limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', metric, limit],
    queryFn: async () => {
      const response = await api.get<LeaderBoardEntry[]>(`/api/leaderboard/${metric}?limit=${limit}`);
      return response.data;
    },
  });
}

export function useMyRank(enabled: boolean = true) {
  return useQuery({
    queryKey: ['leaderboard', 'my-rank'],
    queryFn: async () => {
      const response = await api.get<MyRankResponse>('/api/leaderboard/my-rank');
      return response.data;
    },
    enabled,
  });
}

export function useActivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await api.post(`/api/super-admin/tenant/${tenantId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useDeactivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await api.post(`/api/super-admin/tenant/${tenantId}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await api.delete(`/api/super-admin/tenant/${tenantId}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string, data: any }) => {
      const response = await api.put(`/api/super-admin/tenant/${tenantId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string, data: { newPlan: string; reason?: string } }) => {
      const response = await api.post(`/api/super-admin/tenant/${tenantId}/change-plan`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}
