package com.inventorysaas.inventory_saas.Repository;
import com.inventorysaas.inventory_saas.Entity.TenantMetrics;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TenantMetricsRepository extends JpaRepository<TenantMetrics,Long> {

    public interface TenantAggregatedMetricsProjection {
        BigDecimal getTotalSells();
        BigDecimal getTotalInventoryValue();
        Long getApiCalls();
        Long getStorageUsed();
    }

    Optional<TenantMetrics> findByTenantIdAndDate(String tenantId, LocalDate date);

    List<TenantMetrics> findByTenantIdAndDateBetween(String tenantId,LocalDate startDate,LocalDate endDate);

    //Top tenants by totalSales of Specific Day
    @Query("SELECT tm FROM TenantMetrics tm WHERE tm.date =:date "+"ORDER BY tm.totalSells DESC")
    List<TenantMetrics> findTopTenantsBySales(@Param("date") LocalDate date);

    //Top tenants by totalInventoryValue of specific day
    @Query("SELECT tm FROM TenantMetrics tm WHERE tm.date =:date "+"ORDER BY tm.totalInventoryValue")
    List<TenantMetrics> findTopTenantsByInventoryValue(@Param("date") LocalDate date);


    //get Aggregated metrics for tenant in specific date range
    @Query("SELECT COALESCE(SUM(tm.totalSells),0) as totalSells, "+
            "COALESCE(SUM(tm.totalInventoryValue),0) as totalInventoryValue, "+
            "COALESCE(SUM(tm.apiCalls),0) as apiCalls, " +
            "COALESCE(SUM(tm.storageUsed),0) as storageUsed " +
            "FROM TenantMetrics tm " +
            "WHERE tm.tenantId =:tenantId "+
            "AND tm.date BETWEEN :startDate AND :endDate"

        )
    TenantAggregatedMetricsProjection getAggregatedMetrics(@Param("tenantId") String tenantId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate
                                  );

    /**
     * Get Metrics for multiple tenants in one query
     */

    @Query("SELECT new map(" +
            "t.tenantId as tenantId, " +
            "SUM(t.totalSells) as totalSells, " +
            "SUM(t.totalInventoryValue) as totalInventoryValue, " +
            "SUM(t.apiCalls) as apiCalls, " +
            "SUM(t.storageUsed) as storageUsed) " +
            "FROM TenantMetrics t " +
            "WHERE t.tenantId IN (:tenantIds) AND " +
            "t.date >=:startDate AND t.date <=:endDate " +
            "GROUP BY t.tenantId")
    List<Map<String,Object>> bulkGetMetricsForTenants(@Param("tenantIds") List<String> tenantIds,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate")LocalDate endDate);
}
