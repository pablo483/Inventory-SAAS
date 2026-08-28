package com.inventorysaas.inventory_saas.Scheduler;

import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Repository.TenantRepository;
import com.inventorysaas.inventory_saas.Service.MetricsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled job for metrics calculations
 */
@Slf4j
@Component
public class MetricsScheduler {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private MetricsService metricsService;

    /**
     * Calculate Daily metrics for all tenants
     * Run Daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void calculateDailyMetricsForAllTenants() {
        log.info("Starting daily metrics  calculations for all tenants");

        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Tenant> activeTenants = tenantRepository.findAll().stream()
                .filter(Tenant::getIsActive)
                .toList();
        int successCount = 0;
        int errorCount = 0;

        for (Tenant tenant : activeTenants) {
            try {
                metricsService.calculateDailyMetrics(tenant.getTenantId(), yesterday);
                successCount++;
            } catch (Exception e) {
                log.error("Error calculating metrics for tenants {}: {}", tenant.getTenantId(), e.getMessage());
                errorCount++;
            }
        }
        log.info("Daily metrics calculation completed :{} success full , {} errors",successCount,errorCount);
    }

    /**
     * Reset api call Counters
     * Runs every day at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void ResetApiCallCounters(){
        metricsService.resetApiCallCounter();
    }

    /**
     * Log Scheduler heartBeat
     */
    @Scheduled(cron = "0 0 * * * *")
    public void schedulerHeartBeat(){
        log.debug("Scheduler HearBeat - system operational");
    }
}
