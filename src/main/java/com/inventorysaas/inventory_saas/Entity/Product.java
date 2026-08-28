package com.inventorysaas.inventory_saas.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.inventorysaas.inventory_saas.Exception.InsufficientStockException;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Product entity - core inventory item
 * Tenant-scoped with relationships to Category and Supplier
 */
@Entity
@Table(name = "products", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_sku", columnNames = { "tenant_id", "sku" })
}, indexes = {
        @Index(name = "idx_tenant_Id", columnList = "tenant_id"),
        @Index(name = "idx_tenant_current_stock", columnList = "tenant_id,current_stock"),
        @Index(name = "idx_category_id", columnList = "category_id"),
        @Index(name = "idx_supplier_id", columnList = "supplier_id")
})
// @FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId",
// type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id=:tenantId")
// @EqualsAndHashCode(callSuper = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "sku", nullable = false)
    private String sku;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "current_stock")
    private Integer currentStock = 0;

    @Builder.Default
    @Column(name = "min_stock_threhold")
    private Integer minStockThreshold = 10;

    /**
     * Version for optimistic locking
     * Automatically incremented by JPA on each update
     */
    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) // Prevents proxy tracing errors
    @JsonIgnore // ✅ CRITICAL: Guarantees that tenant stays 'null' or ignored in your cache
                // strings uniformly
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Supplier supplier;

    @Transient
    @JsonIgnore // ✅ Tells Jackson: "Don't try to look for a 'lowStock' database column or field
                // in the JSON"
    public Boolean isLowStock() {
        return currentStock <= minStockThreshold;
    }

    /**
     * Increase stock (thread-safe with optimistic locking)
     */
    public void increaseStock(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive or more than zero ");
        }
        this.currentStock += quantity;
    }

    /**
     * Decrease stock with validation (thread-safe with optimistic locking)
     */
    public void decreaseStock(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive or more than zero");
        }

        if (this.currentStock < quantity) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for product :%s, Available :%d, Requested :%d", this.sku,
                            this.currentStock, quantity));
        }
        this.currentStock -= quantity;
    }
}
