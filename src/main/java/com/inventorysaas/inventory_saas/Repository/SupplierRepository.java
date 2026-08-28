package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.Entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    //    List<Supplier> findByTenantId(String tenantId);
    Page<Supplier> findByTenantId(String tenantId, Pageable pageable);

    Optional<Supplier> findByTenantIdAndName(String tenantId, String name);

    boolean existsByTenantIdAndName(String tenantId, String name);

    Long countByTenantId(String tenantId);


}
