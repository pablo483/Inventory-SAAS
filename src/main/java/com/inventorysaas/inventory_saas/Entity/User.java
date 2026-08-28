package com.inventorysaas.inventory_saas.Entity;

import com.inventorysaas.inventory_saas.Enum.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;
/**
 * User entity - represents users within tenants
 * SUPER_ADMIN users have NULL tenant_id (can access all tenants)
 * Regular users are scoped to a specific tenant
 */
@Entity
//@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_name", columnNames = {"tenant_id", "user_name"}),
        @UniqueConstraint(name = "uk_email", columnNames = "email")
},

        indexes = {
                @Index(name = "idx_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_tenant_name", columnList = "tenant_id,user_name")

        }
)
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //   NULL for SUPER_ADMIN, required for tenant users
    @Column(name = "tenant_id",length = 50)
    private String tenantId;

    @Column(name = "user_name", nullable = false, length = 32)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_no", unique = true, length = 10)
    private String phone;

    @Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role=Role.TENANT_USER;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

}
