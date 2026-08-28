package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.DTO.LowStockReportResponse;
import com.inventorysaas.inventory_saas.DTO.ProductSalesStat;
import com.inventorysaas.inventory_saas.Entity.StockTransaction;
import com.inventorysaas.inventory_saas.Enum.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {


    public interface SalesSummaryTotalsProjection {
        Long getTotalTransactions();
        Long getTotalQuantitySold();
        BigDecimal getTotalSalesValue();
    }

    Page<StockTransaction> findByTenantId(String tenantId, Pageable pageable);

    //    List<StockTransaction> findByTenantIdAndProductId(String tenantId,Long productId);
    Page<StockTransaction> findByTenantIdAndProductId(String tenantId, Long productId, Pageable pageable);


//    //Find Transaction within date Range
//    @Query("SELECT st FROM StockTransaction st WHERE st.tenantId =:tenantId " + "AND st.transactionDate BETWEEN :startDate AND :endDate " + "ORDER BY st.transactionDate DESC")
//    List<StockTransaction> findByTenantIdAndDateRange(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
//    //{ findByTenantIdAndTransactionDateBetweenOrderByTransactionDateDesc(...) } we can also use this instead of above query

    @Query("SELECT st FROM StockTransaction st WHERE st.tenantId =:tenantId " + "AND st.transactionDate BETWEEN :startDate AND :endDate " + "ORDER BY st.transactionDate DESC")
    Page<StockTransaction> findByTenantIdAndDateRange(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    //{ findByTenantIdAndTransactionDateBetweenOrderByTransactionDateDesc(...) } we can also use this instead of above query


    // Calculate total sales quantity for a tenant in date range
    @Query("SELECT COALESCE(SUM(st.quantity),0) FROM StockTransaction st WHERE st.tenantId =:tenantId " + "AND st.transactionType =:transactionType " + "AND st.transactionDate BETWEEN :startDate AND :endDate")
    Long SumQuantityByTenantAndTypeAndDateRange(@Param("tenantId") String tenantId,
                                                @Param("transactionType") TransactionType transactionType,
                                                @Param("startDate") LocalDateTime startDate, @Param("endDate") String endDate);


    @Query("SELECT t.product.id as productId, " +
            "COALESCE(SUM(CASE WHEN t.transactionType = 'STOCK_IN' THEN t.quantity ELSE 0 END),0) as totalIn, " +
            "COALESCE(SUM(CASE WHEN t.transactionType = 'STOCK_OUT' THEN t.quantity ELSE 0 END),0) as totalOut " +
            "FROM StockTransaction t " + "WHERE t.tenantId = :tenantId " + "GROUP BY t.product.id")
    List<StockSumProjection> findAllStockSumByTenant(@Param("tenantId") String tenantId);

    /**
     * get product sales statistics for tenant
     */

    @Query("SELECT new com.inventorysaas.inventory_saas.DTO.ProductSalesStat(" +
            "p.id,p.sku,p.name,c.name, " +
            "SUM(st.quantity), " +
            "SUM(st.quantity * p.price), " +
            "COUNT(st.id), " +
            "AVG(p.price)) " +
            "FROM StockTransaction st " +
            "JOIN st.product p " +
            "JOIN p.category c " +
            "WHERE st.tenantId =:tenantId " +
            "AND st.transactionType= 'STOCK_OUT' " +
            "AND st.transactionReason= 'SELL' " +
            "AND st.transactionDate BETWEEN :startDate AND :endDate " +
            "GROUP BY p.id,p.sku,p.name,c.name " +
            "ORDER BY SUM(st.quantity) DESC ")
    List<ProductSalesStat> getProductSalesStat(@Param("tenantId") String tenantId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);


    /**
     * Get sales Summary totals
     */
    @Query("SELECT COUNT(st.id) as totalTransactions, SUM(st.quantity) as totalQuantitySold, SUM(st.quantity * p.price) as totalSalesValue " +
    "FROM StockTransaction st " +
    "JOIN st.product p " +
    "WHERE st.tenantId =:tenantId " + "AND st.transactionType = 'STOCK_OUT' " + "AND st.transactionReason = 'SELL' " + "AND st.transactionDate BETWEEN :startDate AND :endDate")
    SalesSummaryTotalsProjection getSalesSummaryTotals(@Param("tenantId") String tenantId,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);



    @Query("SELECT SUM(st.quantity * p.price) FROM StockTransaction st JOIN st.product p WHERE st.tenantId =:tenantId AND st.transactionType = 'STOCK_OUT' "+
    "AND st.transactionReason ='SELL'")
    BigDecimal calculateTotalSalesValue(@Param("tenantId") String tenantId);
}
