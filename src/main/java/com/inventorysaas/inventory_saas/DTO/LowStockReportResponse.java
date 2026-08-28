package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
/**
 Response Dto for LowStockReport
*/

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LowStockReportResponse {

    private Integer totalLowStockProducts;
    private BigDecimal totalValueAtRisk;
    private List<LowStockItem> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LowStockItem{
        private Long productId;
        private String sku;
        private String name;
        private String categoryName;
        private String supplierName;
        private Integer currentStock;
        private Integer minStockThreshold;
        private Integer shortFall;
        private BigDecimal unitPrice;
        private BigDecimal totalValue;
        private Integer daysUntilOutOfStock;//Estimated based on average daily usage
    }
}
