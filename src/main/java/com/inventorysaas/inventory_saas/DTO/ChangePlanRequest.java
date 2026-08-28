package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for changing Subscription plan
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePlanRequest {
    @NotNull(message = "New Subscription plan is required")
    private SubscriptionPlan newPlan;

    private String reason;
}
