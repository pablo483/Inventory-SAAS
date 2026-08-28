package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByTenantId(String tenantId);

    Optional<Category> findByTenantIdAndName(String tenantId,String name);

    boolean existsByTenantIdAndName(String tenantId,String name);

    Long countByTenantId(String tenantId);

}
