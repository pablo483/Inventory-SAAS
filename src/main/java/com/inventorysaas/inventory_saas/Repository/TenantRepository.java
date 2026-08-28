package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

        Optional<Tenant> findByTenantId(String tenantId);

        Optional<Tenant> findByEmail(String email);

        boolean existsByEmail(String email);

        boolean existsByTenantId(String tenantId);

        /**
         * Bulk Count all resources per tenants in one query
         */
        @Query("SELECT new map(" +
                        "t.tenantId as tenantId, " +
                        "COUNT(DISTINCT u.id) as UserCount, " +
                        "COUNT(DISTINCT p.id) as ProductCount, " +
                        "COUNT(DISTINCT c.id) as CategoryId, " +
                        "COUNT(DISTINCT s.id) as SupplierId) " +
                        "FROM Tenant t " +
                        "LEFT JOIN User u ON u.tenantId = t.tenantId " +
                        "LEFT JOIN Product p ON p.tenantId = t.tenantId " +
                        "LEFT JOIN Category c ON c.tenantId = t.tenantId " +
                        "LEFT JOIN Supplier s ON s.tenantId =t.tenantId " +
                        "WHERE t.tenantId IN (:tenantIds) " +
                        "GROUP BY t.id")
        List<Map<String, Object>> bulkCountResourcesByTenantIds(@Param("tenantIds") List<String> tenantIds);

        /**
         * Get paginated tenants with filtering
         */
        @Query("SELECT t FROM Tenant t WHERE " +
                        "(:searchTerm IS NULL OR " +
                        "LOWER(t.companyName) LIKE LOWER(CONCAT('%', :searchTerm,'%')) OR " +
                        "LOWER(t.email) LIKE LOWER(CONCAT('%',:searchTerm,'%')) OR " +
                        "LOWER(t.tenantId) LIKE LOWER(CONCAT('%',:searchTerm,'%'))) AND " +
                        "(:plan IS NULL OR t.subscriptionPlan =:plan) AND " +
                        "(:isActive IS NULL OR t.isActive = :isActive)")
        Page<Tenant> findTenantsByFiltering(@Param("searchTerm") String searchTerm,
                        @Param("plan") SubscriptionPlan plan,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);
}
