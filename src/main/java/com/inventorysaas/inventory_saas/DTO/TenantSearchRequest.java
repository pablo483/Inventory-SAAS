package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for searching tenants
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TenantSearchRequest {

    private String searchTerm;// search in companyName or email or tenantId
    private SubscriptionPlan subscriptionPlan;
    private Boolean isActive;
    private String sorBy;//createdAt ,companyName ,subscriptionPlan
    private String sortDirection;//ASC,DSC
}
