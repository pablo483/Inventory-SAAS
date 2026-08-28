package com.inventorysaas.inventory_saas.Tenant.Context;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantContext {

    private String tenantId;

    private Long userId;

    private String userRole;

    private SubscriptionPlan subscriptionPlan;
    
    public Boolean isSuperAdmin() {
        return "SUPER_ADMIN".equals(userRole) || "ROLE_SUPER_ADMIN".equals(userRole);
    }

    public Boolean hasTenantId() {
        return tenantId != null && !tenantId.isEmpty();
    }


}
