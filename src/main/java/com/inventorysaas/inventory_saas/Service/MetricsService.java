package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.TenantUsageMetricsResponse;
import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Entity.TenantMetrics;
import com.inventorysaas.inventory_saas.Redis.Service.LeaderBoardService;
import com.inventorysaas.inventory_saas.Redis.Service.TenantCacheService;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Repository.StockTransactionRepository;
import com.inventorysaas.inventory_saas.Repository.TenantMetricsRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Service for tracking and reporting tenant usage metrics
 */
@Service
@Slf4j
public class MetricsService {

    @Autowired
    private TenantCacheService tenantCacheService;

    @Autowired
    private TenantMetricsRepository tenantMetricsRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LeaderBoardService leaderBoardService;

    private final AtomicLong apiCallCounter = new AtomicLong(0);

    // increment apiCallCounter for the current tenant
    public void incrementApiCallCounter() {
        apiCallCounter.incrementAndGet();
    }

    /*
     * get current tenant usage metrics
     */
    @Transactional(readOnly = true)
    public TenantUsageMetricsResponse getTenantUsageMetrics(LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        // find tenant from cache for tenant name
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);

        // Get aggregated metrics
        TenantMetricsRepository.TenantAggregatedMetricsProjection aggregated = tenantMetricsRepository
                .getAggregatedMetrics(tenantId, startDate, endDate);

        BigDecimal totalSales = aggregated != null && aggregated.getTotalSells() != null ? aggregated.getTotalSells()
                : BigDecimal.ZERO;
        BigDecimal totalInventoryValue = aggregated != null && aggregated.getTotalInventoryValue() != null
                ? aggregated.getTotalInventoryValue()
                : BigDecimal.ZERO;
        long totalApiCalls = aggregated != null && aggregated.getApiCalls() != null ? aggregated.getApiCalls() : 0L;
        long totalStorageUsed = aggregated != null && aggregated.getStorageUsed() != null ? aggregated.getStorageUsed()
                : 0L;

        // Get daily break down
        List<TenantMetrics> dailyData = tenantMetricsRepository.findByTenantIdAndDateBetween(tenantId, startDate,
                endDate);

        List<TenantUsageMetricsResponse.DailyMetrics> dailyMetrics = dailyData.stream()
                .map(tm -> TenantUsageMetricsResponse.DailyMetrics.builder()
                        .date(tm.getDate())
                        .sales(tm.getTotalSells())
                        .apiCalls(tm.getApiCalls())
                        .storageUsed(tm.getStorageUsed())
                        .inventoryValue(tm.getTotalInventoryValue())
                        .build())
                .collect(Collectors.toList());

        return TenantUsageMetricsResponse.builder()
                .companyName(tenant.getCompanyName())
                .tenantId(tenantId)
                .totalApiCalls(totalApiCalls)
                .totalSells(totalSales)
                .totalInventoryValue(totalInventoryValue)
                .totalStorageUsed(totalStorageUsed)
                .dailyMetrics(dailyMetrics)
                .build();
    }

    /*
     * Calculate and Persist daily metrics for tenant
     * called by scheduled job
     */
    @Transactional
    public void calculateDailyMetrics(String tenantId, LocalDate date) {
        try {

            // checks if metrics already exist for date
            if (tenantMetricsRepository.findByTenantIdAndDate(tenantId, date).isPresent()) {
                log.debug("Metrics already exists for tenant {} on :{} ", tenantId, date);
                return;
            }

            BigDecimal dailySales = stockTransactionRepository.calculateTotalSalesValue(tenantId);

            BigDecimal totalInventoryValue = productRepository.calculateTotalInventoryValue(tenantId);

            // API calls (from counter - in production, would be tracked per day)
            long totalApiCalls = apiCallCounter.get();

            // Storage used simplified count products
            Long totalStorageUsed = calculateStorageUsed(tenantId);

            TenantMetrics tenantMetrics = TenantMetrics.builder()
                    .storageUsed(totalStorageUsed)
                    .apiCalls(totalApiCalls)
                    .date(date)
                    .totalSells(dailySales)
                    .totalInventoryValue(totalInventoryValue)
                    .tenantId(tenantId)
                    .build();

            // saved daily metrics to db
            tenantMetricsRepository.save(tenantMetrics);

            // update leaderboard
            leaderBoardService.updateSalesScore(tenantId, dailySales);
            leaderBoardService.updateInventoryValueScore(tenantId, totalInventoryValue);

            log.info("Calculated tenant Daily metrics successfully for tenant {} on {} :Sales:${} :Inventory :${}",
                    tenantId, date, dailySales, totalInventoryValue);

        } catch (Exception e) {
            log.error("Error calculating daily metric for tenant {} on :{}", tenantId, date, e.getMessage(), e);
        }

    }

    /*
     * calculate storage used
     */
    private Long calculateStorageUsed(String tenantID) {

        // In production ,calculate actual storage
        // for now ,estimate based on record count
        long productCount = productRepository.countByTenantId(tenantID);

        // estimate 1 kp for product ,500 bytes per transaction
        return productCount * 1024L;

    }

    /*
     * Reset asi call counter
     */
    public void resetApiCallCounter() {
        apiCallCounter.set(0);
    }
}
