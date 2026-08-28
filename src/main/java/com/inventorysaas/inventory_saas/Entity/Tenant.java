package com.inventorysaas.inventory_saas.Entity;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

/**
 * Tenant entity - represents a company/organization in the multi-tenant system
 * This is the root of tenant isolation
 */
@Entity
@Table(name = "tenants", indexes = {
        @Index(name = "idx_tenant-id", columnList = "tenant_id", unique = true),
        @Index(name = "idx_email", columnList = "email")
})
//@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tenant extends BaseEntity  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", unique = true, nullable = false, length = 50)
    private String tenantId;

    @Column(name = "company_name", nullable = false, length = 50)
    String companyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_plan", nullable = false, length = 50)
    private SubscriptionPlan subscriptionPlan;

    @Column(name = "email", nullable = false, length = 50, unique = true)
    String email;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "json_config", columnDefinition = "TEXT")
    private String jsonConfig;

}
