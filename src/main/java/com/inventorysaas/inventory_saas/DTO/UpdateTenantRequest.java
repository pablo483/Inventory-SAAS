package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating tenant information
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTenantRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @Email(message = "Valid email is required")
    private String email;

    private SubscriptionPlan subscriptionPlan;

    private Boolean isActive;

    private String configJson;
}
