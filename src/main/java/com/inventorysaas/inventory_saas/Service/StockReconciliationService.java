package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.StockSummaryResponse;
import com.inventorysaas.inventory_saas.Entity.Product;
import com.inventorysaas.inventory_saas.Entity.StockTransaction;
import com.inventorysaas.inventory_saas.Enum.TransactionType;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Redis.Service.ProductCacheService;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Repository.StockSumProjection;
import com.inventorysaas.inventory_saas.Repository.StockTransactionRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class StockReconciliationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private ProductCacheService productCacheService;

    // Reconcile stock for all products

    @Transactional(readOnly = true)
    public List<StockSummaryResponse> reconcileStockProducts() {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        // Fetch all products (Query 1)
        List<Product> products = productRepository.findByTenantId(tenantId, Pageable.unpaged()).getContent();

        // Fetch all transaction sum (Quer 2) COALESCE ensures no null
        List<StockSumProjection> allSums = stockTransactionRepository.findAllStockSumByTenant(tenantId);
        // Map for 0(1) lookup
        Map<Long, StockSumProjection> mapSum = allSums.stream()
                .collect(Collectors.toMap(StockSumProjection::getProductId, s -> s)); // same as this
                                                                                      // {.toMap(t->t.getProductId())}
        // Build responses
        return products.stream()
                .map(product -> reconcileProducts(product, mapSum.get(product.getId())))
                .collect(Collectors.toList());
    }

    // Reconcile stock for specific product
    @Transactional(readOnly = true)
    public StockSummaryResponse reconcileStockProduct(Long productId) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        Product product = productCacheService.getProductCache(tenantId, productId);
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id " + tenantId);
        }
        return reconcileProduct(product);
    }

    // Internal reconciliation logic for all products
    private StockSummaryResponse reconcileProducts(Product product, StockSumProjection sum) {

        int totalStockIn = (sum != null) ? sum.getTotalIn() : 0;
        int totalStockOut = (sum != null) ? sum.getTotalOut() : 0;

        int calculatedStock = totalStockIn - totalStockOut;
        boolean isReconciled = product.getCurrentStock().equals(calculatedStock);

        // calculate total value
        BigDecimal totalValue = product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));

        if (!isReconciled) {
            log.warn("Stock mismatch for Product :{} - Current :{} - Calculated :{}", product.getSku(),
                    product.getCurrentStock(), calculatedStock);
        }

        return StockSummaryResponse.builder()
                .sku(product.getSku())
                .productId(product.getId())
                .name(product.getName())
                .calculatedStock(calculatedStock)
                .currentStock(product.getCurrentStock())
                .isReconciled(isReconciled)
                .totalStockIn(totalStockIn)
                .totalStockOut(totalStockOut)
                .totalValue(totalValue)
                .build();
    }

    /**
     * Internal reconciliation logic for specific product
     */
    private StockSummaryResponse reconcileProduct(Product product) {
        List<StockTransaction> transactions = stockTransactionRepository.findByTenantIdAndProductId(
                product.getTenantId(),
                product.getId(),
                Pageable.unpaged()).getContent();

        // Calculate total stock in
        Integer totalStockIn = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.STOCK_IN)
                .mapToInt(StockTransaction::getQuantity)
                .sum();

        // Calculate total stock out
        Integer totalStockOut = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.STOCK_OUT)
                .mapToInt(StockTransaction::getQuantity)
                .sum();

        // Calculated stock should equal current stock
        Integer calculatedStock = totalStockIn - totalStockOut;
        Boolean isReconciled = calculatedStock.equals(product.getCurrentStock());

        // Calculate total value
        BigDecimal totalValue = product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));

        if (!isReconciled) {
            log.warn("Stock mismatch for product {}: Current={}, Calculated={}",
                    product.getSku(), product.getCurrentStock(), calculatedStock);
        }

        return StockSummaryResponse.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .currentStock(product.getCurrentStock())
                .totalStockIn(totalStockIn)
                .totalStockOut(totalStockOut)
                .calculatedStock(calculatedStock)
                .isReconciled(isReconciled)
                .totalValue(totalValue)
                .build();
    }
}
