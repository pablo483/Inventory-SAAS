package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Response Dto for Tenant Usage Metrics Report
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TenantUsageMetricsResponse {

    private String tenantId;
    private String companyName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalApiCalls;
    private Long totalStorageUsed;
    private BigDecimal totalSells;
    private BigDecimal totalInventoryValue;
    private List<DailyMetrics> dailyMetrics;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyMetrics {
        private LocalDate date;
        private Long apiCalls;
        private Long storageUsed;
        private BigDecimal sales;
        private BigDecimal inventoryValue;
    }

}
