package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TenantCreationRequest {

    @NotBlank(message = "tenant name is required")
    private String companyName;


    private SubscriptionPlan subscriptionPlan=SubscriptionPlan.BASIC;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

}
