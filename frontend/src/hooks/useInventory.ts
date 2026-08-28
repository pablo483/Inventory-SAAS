import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PageResponse } from './useProducts';

export type TransactionType = 'IN' | 'OUT' | 'TRANSFER';
export type TransactionReason = 
  | 'PURCHASE' 
  | 'RETURN' 
  | 'SELL' 
  | 'DAMAGE' 
  | 'TRANSFER';

export interface StockTransaction {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  transactionType: TransactionType;
  stockBefore: number;
  stockAfter: number;
  reason: TransactionReason;
  quantity: number;
  transactionDate: string;
  performedBy: string;
  note: string;
}

export function useTransactions(page = 0, size = 50) {
  return useQuery({
    queryKey: ['transactions', page, size],
    queryFn: async () => {
      const response = await api.get<PageResponse<StockTransaction>>(`/api/inventory/transactions?page=${page}&size=${size}`);
      return response.data;
    },
  });
}

export function useTransactionsRange(startDate: string | null, endDate: string | null, page = 0, size = 50) {
  return useQuery({
    queryKey: ['transactions', 'range', startDate, endDate, page, size],
    queryFn: async () => {
      if (!startDate || !endDate) return null;
      const formattedStart = `${startDate}T00:00:00`;
      const formattedEnd = `${endDate}T23:59:59`;
      const response = await api.get<PageResponse<StockTransaction>>(`/api/inventory/transactions/range?startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { productId: number; quantity: number; reason: string; supplierId?: number; notes?: string }) => {
      const response = await api.post('/api/inventory/stock-in', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useStockOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { productId: number; quantity: number; reason: string; notes?: string }) => {
      const response = await api.post('/api/inventory/stock-out', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useStockTransfer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fromProductId: number; toProductId: number; quantity: number; reason: string; notes?: string }) => {
      const response = await api.post('/api/inventory/transfer', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productTransactions'] });
    },
  });
}

export function useProductTransactions(productId: number, page = 0, size = 20) {
  return useQuery({
    queryKey: ['productTransactions', productId, page, size],
    queryFn: async () => {
      if (!productId) return null;
      const response = await api.get<PageResponse<StockTransaction>>(`/api/inventory/transactions/product/${productId}?page=${page}&size=${size}`);
      return response.data;
    },
    enabled: !!productId,
  });
}
export interface StockSummary {
  productId: number;
  sku: string;
  name: string;
  currentStock: number;
  totalStockIn: number;
  totalStockOut: number;
  calculatedStock: number;
  isReconciled: boolean;
  totalValue: number;
}

export function useReconciliation() {
  return useQuery({
    queryKey: ['reconciliation'],
    queryFn: async () => {
      const response = await api.get<StockSummary[]>('/api/inventory/reconcile');
      return response.data;
    },
  });
}

export function useProductReconciliation(productId: number | null) {
  return useQuery({
    queryKey: ['reconciliation', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await api.get<StockSummary>(`/api/inventory/reconcile/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });
}
