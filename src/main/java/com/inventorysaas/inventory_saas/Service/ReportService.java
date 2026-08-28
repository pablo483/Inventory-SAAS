package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.LowStockReportResponse;
import com.inventorysaas.inventory_saas.DTO.ProductSalesStat;
import com.inventorysaas.inventory_saas.DTO.SalesSummaryResponse;
import com.inventorysaas.inventory_saas.Entity.Product;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Repository.StockTransactionRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/*
 * Service for generating report
 */
@Service
@Slf4j
public class ReportService {

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private StockTransactionRepository stockTransactionRepository;

        // Generate low stock report
        @Transactional(readOnly = true)
        public LowStockReportResponse generateLowStockReport(Integer threshold) {

                String tenantId = TenantContextHolder.getCurrentTenantId();

                // use customer threshold if not use default
                List<Product> lowStockProducts;

                if (threshold != null) {
                        lowStockProducts = productRepository.findProductsBelowCustomThreshold(tenantId, threshold);
                } else {
                        lowStockProducts = productRepository.findLowStockProducts(tenantId, Pageable.unpaged())
                                        .getContent();
                }

                BigDecimal totalValueAtRisk = lowStockProducts.stream()
                                .map(product -> product.getPrice()
                                                .multiply(BigDecimal.valueOf(product.getCurrentStock())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<LowStockReportResponse.LowStockItem> items = lowStockProducts.stream()
                                .map(this::buildLowStockItem)
                                .toList();

                log.info("Generated low stock report for tenant {} :{} products at risk", tenantId, items.size());

                return LowStockReportResponse.builder()
                                .totalValueAtRisk(totalValueAtRisk)
                                .totalLowStockProducts(items.size())
                                .items(items)
                                .build();
        }

        // Generate sales Summary Report
        @Transactional(readOnly = true)
        public SalesSummaryResponse generateSalesSummaryReport(LocalDate startDate, LocalDate endDate) {
                String tenantId = TenantContextHolder.getCurrentTenantId();
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

                // get Products sales Summary totals
                StockTransactionRepository.SalesSummaryTotalsProjection totals = stockTransactionRepository
                                .getSalesSummaryTotals(tenantId, startDateTime,
                                                endDateTime);
                long totalTransactions = totals != null && totals.getTotalTransactions() != null
                                ? totals.getTotalTransactions()
                                : 0L;
                long totalQuantitySold = totals != null && totals.getTotalQuantitySold() != null
                                ? totals.getTotalQuantitySold()
                                : 0L;
                BigDecimal totalSalesValue = totals != null && totals.getTotalSalesValue() != null
                                ? totals.getTotalSalesValue()
                                : BigDecimal.ZERO;

                // Calculate average
                BigDecimal averageTransactionValue = totalTransactions > 0
                                ? totalSalesValue.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // get topSellingProducts
                List<ProductSalesStat> topProducts = stockTransactionRepository.getProductSalesStat(tenantId,
                                startDateTime, endDateTime);

                // get sales by category(aggregate from products)
                List<SalesSummaryResponse.CategorySalesStat> categoryStats = topProducts.stream()
                                .collect(Collectors.groupingBy(
                                                ProductSalesStat::getCategoryName,
                                                Collectors.collectingAndThen(
                                                                Collectors.toList(),
                                                                products -> {
                                                                        Long totalQuantity = products.stream()
                                                                                        .mapToLong(ProductSalesStat::getQuantitySold)
                                                                                        .sum();
                                                                        BigDecimal totalValue = products.stream()
                                                                                        .map(ProductSalesStat::getTotalSalesValue)
                                                                                        .reduce(BigDecimal.ZERO,
                                                                                                        BigDecimal::add);
                                                                        Long totalCount = products.stream()
                                                                                        .mapToLong(ProductSalesStat::getTransactionCount)
                                                                                        .sum();

                                                                        return SalesSummaryResponse.CategorySalesStat
                                                                                        .builder()
                                                                                        .salesValue(totalValue)
                                                                                        .quantitySold(totalQuantity)
                                                                                        .name(products.get(0)
                                                                                                        .getCategoryName())
                                                                                        .transactionCount(totalCount)
                                                                                        .build();

                                                                })))
                                .values()
                                .stream()
                                .sorted((a, b) -> b.getSalesValue().compareTo(a.getSalesValue()))
                                .collect(Collectors.toList());

                log.info("Generated sales Summary report for tenant {} :({} - {}), {} transactions : ${}", tenantId,
                                startDate, endDate, totalTransactions, totalSalesValue);

                return SalesSummaryResponse.builder()
                                .startDate(startDate)
                                .endDate(endDate)
                                .totalSalesValue(totalSalesValue)
                                .averageTransactionValue(averageTransactionValue)
                                .totalQuantitySold(totalQuantitySold)
                                .totalTransactions(totalTransactions)
                                .topSellingProducts(topProducts)
                                .salesByCategory(categoryStats)
                                .build();

        }

        // Build low stock item from product
        private LowStockReportResponse.LowStockItem buildLowStockItem(Product product) {

                int shortFall = product.getMinStockThreshold() - product.getCurrentStock();
                BigDecimal totalValue = product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));

                // Days until out of stock (ill use aii integration for this later)
                Integer daysUntilOutOfStock = estimateDaysUntilOutOfStock(product);

                return LowStockReportResponse.LowStockItem.builder()
                                .productId(product.getId())
                                .sku(product.getSku())
                                .name(product.getName())
                                .currentStock(product.getCurrentStock())
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                                .shortFall(shortFall)
                                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                                .minStockThreshold(product.getMinStockThreshold())
                                .unitPrice(product.getPrice())
                                .totalValue(totalValue)
                                .daysUntilOutOfStock(daysUntilOutOfStock)
                                .build();

        }

        /*
         * Estimate days until product runs out of stock
         * Based on average daily usage over 30 days
         */
        private Integer estimateDaysUntilOutOfStock(Product product) {
                if (product.getCurrentStock() <= 0) {
                        return 0;
                }
                double averageDailyUsage = product.getCurrentStock() * 0.1;
                if (averageDailyUsage == 0) {
                        return 999;
                }
                return (int) Math.ceil(averageDailyUsage);// if 0.5 like this in points come it will round up to single
                                                          // digit like 1,10
        }

}
