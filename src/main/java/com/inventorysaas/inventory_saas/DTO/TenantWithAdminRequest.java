package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantWithAdminRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 50, message = "Company name cannot exceed 50 characters")
    private String companyName;

    @NotBlank(message = "Company email is required")
    @Email(message = "Invalid company email format")
    @Size(max = 50, message = "Email cannot exceed 50 characters")
    private String companyEmail;

    @NotNull(message = "Subscription plan is required")
    private SubscriptionPlan subscriptionPlan;

    @NotBlank(message = "Admin username is required")
    @Size(min = 3, message = "Admin username must be at least 3 characters")
    private String adminUsername;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid admin email format")
    private String adminEmail;

    @NotBlank(message = "Admin password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String adminPassword;

    @NotBlank(message = "Admin phone is required")
    @Size(min = 10, max = 10, message = "Phone must be exactly 10 digits")
    private String adminPhone;
}
