package com.inventorysaas.inventory_saas.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.w3c.dom.Text;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

/**
 * Suppliers - tenant-scoped
 * Each tenant manages their own suppliers
 */
@Entity
@Table(name = "suppliers",
        uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_supplier_name", columnNames = {"tenant_id", "name"}),

},
//doesn't need indexes cause unique constrains also add index
indexes = {
        @Index(name = "idx_tenant_name",columnList = "tenant_id")
}
)
@Filter(name = "tenantFilter", condition = "tenant_id=:tenantId")
//@EqualsAndHashCode(callSuper = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Supplier extends BaseEntity  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "address", nullable = false, length = 50)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @JsonIgnore
    private Tenant tenant;


}
