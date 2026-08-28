package com.inventorysaas.inventory_saas.DTO;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 *  System-wide metrics for Super Admin DashBoard
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GlobalMetricsResponse {

    //Tenant statistics
    private Integer totalTenants;
    private Integer totalActiveTenants;
    private Integer inactiveTenants;

    //Subscription statistics
    private Map<String,Integer> tenantsByPlan;//BASIC:10,INTERMEDIATE:6,ENTERPRISE:2s

    //User statistics
    private Long totalUsers;
    private Long totalAdmins;
    private Long totalRegularUsers;

    //Product Statistics
    private Long totalProducts;
    private Long totalCategories;
    private Long totalSuppliers;

    //StockTransactions statistics
    private Long totalStockTransactions;
    private BigDecimal totalSystemSales;
    private BigDecimal totalSystemInventoryValue;

    //Api statistics
    private Long totalApiCalls;
    private Long totalStorageUsed;

    //Growth Metrics
    private Long newTenantsThisMonth;
    private Long newUsersThisMonths;
}
