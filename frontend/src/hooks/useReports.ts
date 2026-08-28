import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// --- Low Stock Report Interfaces ---
export interface LowStockItem {
  productId: number;
  sku: string;
  name: string;
  categoryName: string;
  supplierName: string;
  currentStock: number;
  minStockThreshold: number;
  shortFall: number;
  unitPrice: number;
  totalValue: number;
  daysUntilOutOfStock: number;
}

export interface LowStockReportResponse {
  totalLowStockProducts: number;
  totalValueAtRisk: number;
  items: LowStockItem[];
}

// --- Sales Summary Interfaces ---
export interface ProductSalesStat {
  productId: number;
  sku: string;
  name: string;
  categoryName: string;
  quantitySold: number;
  totalSalesValue: number;
  transactionCount: number;
  averagePrice: number;
}

export interface CategorySalesStat {
  name: string;
  quantitySold: number;
  salesValue: number;
  transactionCount: number;
}

export interface SalesSummaryResponse {
  startDate: string;
  endDate: string;
  totalTransactions: number;
  totalQuantitySold: number;
  totalSalesValue: number;
  averageTransactionValue: number;
  topSellingProducts: ProductSalesStat[];
  salesByCategory: CategorySalesStat[];
}

// --- Usage Metrics Interfaces ---
export interface DailyMetrics {
  date: string;
  apiCalls: number;
  storageUsed: number;
  sales: number;
  inventoryValue: number;
}

export interface TenantUsageMetricsResponse {
  tenantId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  totalApiCalls: number;
  totalStorageUsed: number;
  totalSells: number;
  totalInventoryValue: number;
  dailyMetrics: DailyMetrics[];
}

// --- Hooks ---

export const useLowStockReport = (threshold?: number) => {
  return useQuery({
    queryKey: ['reports', 'low-stock', threshold],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (threshold !== undefined) params.append('threshold', threshold.toString());
      const { data } = await api.get<LowStockReportResponse>(`/api/reports/low-stock?${params.toString()}`);
      return data;
    },
  });
};

export const useSalesSummaryReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['reports', 'sales-summary', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<SalesSummaryResponse>(
        `/api/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`
      );
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useUsageMetrics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['reports', 'usage-metrics', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<TenantUsageMetricsResponse>(
        `/api/reports/usage-metrics?startDate=${startDate}&endDate=${endDate}`
      );
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};

// --- Export Functions ---

export const downloadCsv = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportLowStockReport = async (threshold?: number) => {
  const params = new URLSearchParams();
  if (threshold !== undefined) params.append('threshold', threshold.toString());
  const response = await api.get(`/api/reports/low-stock/export?${params.toString()}`, {
    responseType: 'blob',
  });
  downloadCsv(response.data, 'low-stock-report.csv');
};

export const exportSalesSummaryReport = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/reports/sales-summary/export?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob',
  });
  downloadCsv(response.data, 'sales-summary-report.csv');
};
