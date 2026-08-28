package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.Entity.Product;
import org.hibernate.cache.spi.SecondLevelCacheLogger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByTenantId(String tenantId, Pageable pageable);

    Optional<Product> findByTenantIdAndSku(String tenantId, String sku);

    //this fetches the product with category and supplier for cache in redis cause it stores whole category and product ,cause it cant access using fetchType lazy
    @Query("SELECT p FROM Product p "+
    "LEFT JOIN FETCH p.category "+
    "LEFT JOIN FETCH p.supplier "+
    "WHERE p.id = :productId")
    Optional<Product> findByIdWithDetails(@Param("productId") Long productId);

    //   List<Product> findByTenantIdAndCategoryId(String tenantId,Long categoryId);
    Page<Product> findByTenantIdAndCategoryId(String tenantId, Long categoryId,Pageable pageable);


    //find low stock products for tenant
    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId " + "AND p.currentStock <= p.minStockThreshold")
    Page<Product> findLowStockProducts(@Param("tenantId") String tenantId,Pageable pageable);

    //find products below specific threshold
    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId " + "AND p.currentStock <= :threshold")
    List<Product> findProductsBelowThreshold(@Param("tenantId") String tenantId, @Param("threshold") Integer threshold);


    //Find products with stock below custom threshold
    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId "+ "AND p.currentStock <= :threshold " + "ORDER BY (p.minStockThreshold - p.currentStock ) DESC" )
    List<Product> findProductsBelowCustomThreshold(@Param("tenantId") String tenantId,
                                                   @Param("threshold") Integer threshold);

    //Calculate total inventory value of tenant
    @Query("SELECT COALESCE(SUM(p.price * p.currentStock),0) FROM Product p WHERE p.tenantId =:tenantId")
    BigDecimal calculateTotalInventoryValue(@Param("tenantId") String tenantId);

    boolean existsByTenantIdAndSku(String tenantId, String sku);

    //count total products for tenant
    long countByTenantId(String tenantId);



}
