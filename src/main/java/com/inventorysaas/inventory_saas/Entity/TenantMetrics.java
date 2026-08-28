package com.inventorysaas.inventory_saas.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.math.BigDecimal;
import java.time.LocalDate;
/**
 * Daily metrics per tenant for billing and analytics
 * Used for leaderboards and usage tracking
 */
@Entity
@Table(name = "tenant_metrics", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_date", columnNames = {"tenant_id", "date"})
},

        indexes = {
                @Index(name = "idx_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_date", columnList = "date")}
)
// @FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id=:tenantId")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TenantMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Builder.Default
    @Column(name = "total_sells", precision = 12, scale = 2)
    private BigDecimal totalSells = BigDecimal.ZERO;

    @Column(name = "total_inventory_value")
    private BigDecimal totalInventoryValue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "api_calls")
    private Long apiCalls = 0L;

    @Builder.Default
    @Column(name = "storage_used", nullable = false)
    private Long storageUsed = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

}
