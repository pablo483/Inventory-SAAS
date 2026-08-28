package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response Dto for Sales Summary Report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesSummaryResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalTransactions;
    private Long totalQuantitySold;
    private BigDecimal totalSalesValue;
    private BigDecimal averageTransactionValue;
    private List<ProductSalesStat> topSellingProducts;
    private List<CategorySalesStat> salesByCategory;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategorySalesStat{
        private String name;
        private Long quantitySold;
        private BigDecimal salesValue;
        private Long transactionCount;
    }
}
