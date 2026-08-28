package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.*;
import com.inventorysaas.inventory_saas.Entity.Product;
import com.inventorysaas.inventory_saas.Entity.StockTransaction;
import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.TransactionReason;
import com.inventorysaas.inventory_saas.Enum.TransactionType;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Redis.Event.EventType;
import com.inventorysaas.inventory_saas.Redis.Publisher.InventoryEventPublisher;
import com.inventorysaas.inventory_saas.Redis.Service.LeaderBoardService;
import com.inventorysaas.inventory_saas.Redis.Service.ProductCacheService;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Repository.StockTransactionRepository;
import com.inventorysaas.inventory_saas.Repository.UserRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import jakarta.persistence.OptimisticLockException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class StockTransactionService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private InventoryEventPublisher inventoryEventPublisher;

    @Autowired
    private LeaderBoardService leaderBoardService;

    @Autowired
    private ProductCacheService productCacheService;

    /**
     * Process stock in transaction
     * - ACID: Atomic update of product stock and transaction creation
     * - Retry on optimistic lock failure
     */
    @Transactional(isolation = Isolation.READ_COMMITTED) // this is for @Retryable cause if one time the transaction
                                                         // failed then second time the code only sees commited data
                                                         // which is new like if the user is updating same data then we
                                                         // get optimistic lock exception ,so we need the newly updated
                                                         // data so by defining read commited we now get the updated new
                                                         // data sometimes data may get old commited only that's why we
                                                         // use Read Commited
    @Retryable(retryFor = {
            OptimisticLockException.class }, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
    public StockTransactionResponse stockIn(StockInRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Long userId = TenantContextHolder.getUserId();

        // Validate reason
        if (request.getReason() != TransactionReason.PURCHASE && request.getReason() != TransactionReason.RETURN) {
            throw new IllegalArgumentException("Invalid reason for stock in ,use RETURN or PURCHASE");
        }
        // Get product directly from DB for critical stock update to avoid stale cache
        // issues
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product not found with id :" + request.getProductId()));
        // Verify tenant ownership
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id :{} " + tenantId);
        }
        // Get current user
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found "));

        // Record stock before transaction
        Integer stockBefore = product.getCurrentStock();
        // Increase stock (optimistic locking handles concurrency)\
        product.increaseStock(request.getQuantity());
        // Save product (version will be automatically incremented) and update cache
        Product updatedProduct = productCacheService.updateProductCache(tenantId, product);

        // Create immutable transaction record
        StockTransaction transaction = StockTransaction.builder()
                .tenantId(tenantId)
                .product(product)
                .quantity(request.getQuantity())
                .transactionReason(request.getReason())
                .transactionType(TransactionType.STOCK_IN)
                .transactionDate(LocalDateTime.now())
                .stockAfter(updatedProduct.getCurrentStock())
                .note(request.getNotes())
                .user(user)
                .build();

        StockTransaction saved = stockTransactionRepository.save(transaction);

        // publish stock change event(Stock IN)
        inventoryEventPublisher.publishStockChange(
                EventType.STOCK_IN,
                tenantId, updatedProduct.getId(),
                updatedProduct.getSku(),
                updatedProduct.getName(),
                request.getQuantity(),
                updatedProduct.getCurrentStock(),
                updatedProduct.getMinStockThreshold(),
                user.getUsername());

        // Update inventory value (Stock increase)
        BigDecimal addedValue = updatedProduct.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        leaderBoardService.incrementInventoryValueScore(tenantId, addedValue);

        log.info("Stock-In: Product {} - Quantity :{} -Before :{} - After :{} - Tenant :{}", updatedProduct.getSku(),
                request.getQuantity(), stockBefore, updatedProduct.getCurrentStock(), tenantId);

        return stockTransactionResponse(saved, stockBefore);
    }

    /**
     * Process stock out transaction
     * - ACID: Atomic update of product stock and transaction creation
     * - Retry on optimistic lock failure
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    @Retryable(retryFor = {
            OptimisticLockException.class }, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
    public StockTransactionResponse stockOut(StockOutRequest request) {

        String tenantId = TenantContextHolder.getCurrentTenantId();
        Long userId = TenantContextHolder.getUserId();

        // Validate reason
        if (request.getReason() != TransactionReason.DAMAGE && request.getReason() != TransactionReason.SELL
                && request.getReason() != TransactionReason.TRANSFER) {
            throw new IllegalArgumentException("Invalid reason for stock out ,Use DAMAGE,SELL,TRANSFER");
        }
        // Get product directly from DB for critical stock update to avoid stale cache
        // issues
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product not found with id :" + request.getProductId()));
        // Verify tenant ownership
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id:{} " + tenantId);
        }
        // get current user
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // Record stock before transaction
        Integer stockBefore = product.getCurrentStock();
        // Decrease stock (optimistic locking handles concurrency)\
        product.decreaseStock(request.getQuantity());
        // Save product (version will be automatically incremented) and update cache
        Product updated = productCacheService.updateProductCache(tenantId, product);
        // Create immutable transaction record
        StockTransaction transaction = StockTransaction.builder()
                .tenantId(tenantId)
                .product(product)
                .stockAfter(updated.getCurrentStock())
                .transactionReason(request.getReason())
                .transactionType(TransactionType.STOCK_OUT)
                .transactionDate(LocalDateTime.now())
                .user(user)
                .quantity(request.getQuantity())
                .note(request.getNotes())
                .build();
        // save transaction
        StockTransaction saved = stockTransactionRepository.save(transaction);

        // publish Stock change event
        inventoryEventPublisher.publishStockChange(
                EventType.STOCK_OUT,
                tenantId, updated.getId(),
                updated.getSku(),
                updated.getName(),
                request.getQuantity(),
                updated.getCurrentStock(),
                updated.getMinStockThreshold(),
                user.getUsername());

        // update sale value if the reason is sale
        if (request.getReason() == TransactionReason.SELL) {
            BigDecimal saleValue = updated.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
            leaderBoardService.incrementSalesScore(tenantId, saleValue);
        }

        // update/decrese inventory value(Negative inventory value)
        BigDecimal inventoryValue = updated.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        leaderBoardService.incrementInventoryValueScore(tenantId, inventoryValue.negate());

        log.info("Stock Out : Product :{} -Quantity :{} - Before :{} - After :{} -Tenant :{}",
                saved.getProduct().getSku(), saved.getQuantity(), stockBefore, saved.getStockAfter(), tenantId);

        // return Response
        return stockTransactionResponse(saved, stockBefore);

    }

    /**
     * Transfer stock between products (atomic two-phase operation)
     */

    @Transactional(isolation = Isolation.SERIALIZABLE)
    @Retryable(retryFor = {
            OptimisticLockException.class }, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
    public List<StockTransactionResponse> stockTransfer(StockTransferRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        if (request.getFromProductId().equals(request.getToProductId())) {
            throw new IllegalArgumentException("Cannot transfer stock to same product");
        }
        // Stock out from source
        StockOutRequest stockOutRequest = new StockOutRequest(
                request.getFromProductId(),
                request.getQuantity(),
                TransactionReason.TRANSFER,
                request.getNotes());
        StockTransactionResponse outTransaction = stockOut(stockOutRequest);
        // Stock in to destination
        StockInRequest stockInRequest = new StockInRequest(
                request.getToProductId(),
                request.getQuantity(),
                TransactionReason.RETURN,
                null,
                request.getNotes());
        StockTransactionResponse inTransaction = stockIn(stockInRequest);

        log.info("Stock transfer : From :{} - to :{} ,quantity :{} - Tenant :{}", request.getFromProductId(),
                request.getToProductId(), request.getQuantity(), tenantId);

        return List.of(outTransaction, inTransaction);
    }

    // get transaction history of product
    @Transactional(readOnly = true)
    public Page<StockTransactionResponse> getProductTransactions(Long productId, Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        Product product = productCacheService.getProductCache(tenantId, productId);

        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with if :{}" + tenantId);
        }

        Page<StockTransaction> transactions = stockTransactionRepository.findByTenantIdAndProductId(tenantId, productId,
                pageable);

        return transactions.map(t -> stockTransactionResponse(t, null));
    }

    /**
     * Get all transactions for tenant (paginated)
     */
    @Transactional(readOnly = true)
    public Page<StockTransactionResponse> getAllTransactions(Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        Page<StockTransaction> transactions = stockTransactionRepository.findByTenantId(tenantId, pageable);

        return transactions.map(t -> stockTransactionResponse(t, null));
    }

    /**
     * Get transactions within date range
     */
    @Transactional(readOnly = true)
    public Page<StockTransactionResponse> getTransactionsWithInDateRange(LocalDateTime startDate, LocalDateTime endDate,
            Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        Page<StockTransaction> transactions = stockTransactionRepository.findByTenantIdAndDateRange(tenantId, startDate,
                endDate, pageable);

        return transactions.map(t -> stockTransactionResponse(t, null));
    }

    // Stock Transaction Response
    public StockTransactionResponse stockTransactionResponse(StockTransaction transaction, Integer stockBefore) {

        return StockTransactionResponse.builder()
                .id(transaction.getId())
                .productId(transaction.getProduct().getId())
                .transactionType(transaction.getTransactionType())
                .productName(transaction.getProduct().getName())
                .productSku(transaction.getProduct().getSku())
                .stockBefore(stockBefore)
                .stockAfter(transaction.getStockAfter())
                .quantity(transaction.getQuantity())
                .reason(transaction.getTransactionReason())
                .note(transaction.getNote())
                .transactionDate(transaction.getTransactionDate())
                .performedBy(transaction.getUser().getUsername())
                .build();

    }

    // //Reconcile stock for all products
    // @Transactional(readOnly = true)
    // public List<StockSummaryResponse> reconcileStockProducts() {
    // String tenantId = TenantContextHolder.getCurrentTenantId();
    //
    // List<Product> products = productRepository.findByTenantId(tenantId,
    // Pageable.unpaged()).getContent();
    //
    // return products.stream()
    // .map(this::reconcileProduct)
    // .collect(Collectors.toList());
    // }
    //
    // //Reconcile stock for specific product
    // @Transactional(readOnly = true)
    // public StockSummaryResponse reconcileStockProduct(Long productId) {
    // String tenantId = TenantContextHolder.getCurrentTenantId();
    //
    // Product product = productRepository.findById(productId).orElseThrow(() -> new
    // ResourceNotFoundException("Product not found with id" + productId));
    //
    // if (!product.getTenantId().equals(tenantId)) {
    // throw new ResourceNotFoundException("Product not found with id " + tenantId);
    // }
    // return reconcileProduct(product);
    // }
    //

    // //Internal reconciliation logic
    // public StockSummaryResponse reconcileProduct(Product product) {
    //
    // List<StockTransaction> transactions =
    // stockTransactionRepository.findByTenantIdAndProductId(product.getTenantId(),
    // product.getId());
    //
    // //calculated total stockIn
    // int totalStockIn = transactions.stream()
    // .filter(t -> t.getTransactionType() == TransactionType.STOCK_IN)
    // .mapToInt(StockTransaction::getQuantity)//same as this
    // {.mapToInt(t->t.getQuantity())}
    // .sum();
    //
    // //calculate total stockOut
    // int totalStockOut = transactions.stream()
    // .filter(t -> t.getTransactionType() == TransactionType.STOCK_OUT)
    // .mapToInt(StockTransaction::getQuantity)
    // .sum();
    //
    // int calculatedStock = totalStockIn - totalStockOut;
    // boolean isReconciled = product.getCurrentStock().equals(calculatedStock);
    //
    // //calculate total value
    // BigDecimal totalValue =
    // product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));
    //
    // if (!isReconciled) {
    // log.warn("Stock mismatch for Product :{} - Current :{} - Calculated :{}",
    // product.getSku(), product.getCurrentStock(), calculatedStock);
    // }
    //
    // return StockSummaryResponse.builder()
    // .sku(product.getSku())
    // .productId(product.getId())
    // .name(product.getName())
    // .calculatedStock(calculatedStock)
    // .currentStock(product.getCurrentStock())
    // .isReconciled(isReconciled)
    // .totalStockIn(totalStockIn)
    // .totalStockOut(totalStockOut)
    // .totalValue(totalValue)
    // .build();
    // }

}
