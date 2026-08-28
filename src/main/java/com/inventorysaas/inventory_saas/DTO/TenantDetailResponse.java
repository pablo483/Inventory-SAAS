package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for details of tenant for Super Admin
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TenantDetailResponse {

    private Long id;
    private String tenantId;
    private String companyName;
    private String email;
    private SubscriptionPlan subscriptionPlan;
    private Boolean isActive;
    private String configJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    //Statistics
    private Integer totalUsers;
    private Integer totalProducts;
    private Integer totalSuppliers;
    private Integer totalCategories;
    private Long totalApiCalls;
    private Long totalStorageUsed;
    private BigDecimal totalSalesVales;
    private BigDecimal inventoryValue;

    //leaderboard rankings
    private Long salesRank;
    private Long inventoryValueRank;

}
