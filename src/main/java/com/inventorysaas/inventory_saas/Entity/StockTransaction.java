package com.inventorysaas.inventory_saas.Entity;

import com.inventorysaas.inventory_saas.Enum.TransactionReason;
import com.inventorysaas.inventory_saas.Enum.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

/**
 * Stock transaction history - immutable audit log
 * Records all stock movements (in/out) with reasons
 */
@Entity
@Table(name = "stock_transaction", indexes = {
        @Index(name = "idx_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_tenant_transaction_date", columnList = "tenant_id,transaction_date"),
        @Index(name = "idx_product_id", columnList = "product_id"),
        @Index(name = "idx_user_id", columnList = "user_id")
})
//@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id=:tenantId")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@EqualsAndHashCode(callSuper = false)
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private TransactionReason transactionReason;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;


    //Stock level after this transaction (for audit trail)
    @Column(name = "stock_after")
    private Integer stockAfter;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    //User who performed the transaction
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @PrePersist
    public void prePersist() {
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }
}
