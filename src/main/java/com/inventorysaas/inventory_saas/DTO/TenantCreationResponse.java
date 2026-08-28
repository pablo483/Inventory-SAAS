package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TenantCreationResponse {
    private String tenantId;
    private String companyName;
    private String email;
    private String subscriptionPlan;
    private String message;
}
