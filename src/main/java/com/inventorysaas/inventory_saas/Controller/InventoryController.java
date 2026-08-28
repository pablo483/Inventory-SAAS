package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.*;
import com.inventorysaas.inventory_saas.Service.StockReconciliationService;
import com.inventorysaas.inventory_saas.Service.StockTransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for inventory transaction management
 */
@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('TENANT_ADMIN','TENANT_USER')")
public class InventoryController {

    @Autowired
    private StockTransactionService stockTransactionService;

    @Autowired
    private StockReconciliationService stockReconciliationService;

    /**
     * Stock in (increase inventory)
     * POST /api/inventory/stock-in
     */
    @PostMapping("/stock-in")
    public ResponseEntity<StockTransactionResponse> stockIn(@Valid @RequestBody StockInRequest request) {
        StockTransactionResponse response = stockTransactionService.stockIn(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Stock out (increase inventory)
     * POST /api/inventory/stock-out
     */
    @PostMapping("/stock-out")
    public ResponseEntity<StockTransactionResponse> stockOut(@Valid @RequestBody StockOutRequest request) {
        StockTransactionResponse response = stockTransactionService.stockOut(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Transfer stock between products
     * POST /api/inventory/transfer
     */
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    @PostMapping("/transfer")
    public ResponseEntity<List<StockTransactionResponse>> transferStock(@Valid @RequestBody StockTransferRequest request) {
        List<StockTransactionResponse> response = stockTransactionService.stockTransfer(request);
        return ResponseEntity.ok(response);
    }


    /**
     * Get transaction history for a product
     * GET /api/inventory/product/{productId}/transactions
     */
    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<Page<StockTransactionResponse>> getProductTransaction(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @PathVariable Long productId) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<StockTransactionResponse> responses = stockTransactionService.getProductTransactions(productId, pageable);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all transactions (paginated)
     * GET /api/inventory/transactions?page=0&size=20
     */
    @GetMapping("/transactions")
    public ResponseEntity<Page<StockTransactionResponse>> getAllTransactions(@RequestParam(defaultValue = "0") Integer page,
                                                                             @RequestParam(defaultValue = "20") Integer size) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<StockTransactionResponse> response = stockTransactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get transactions by date range
     * GET /api/inventory/transactions/range?start=2024-01-01T00:00:00&end=2024-12-31T23:59:59
     */
    @GetMapping("/transactions/range")
    public ResponseEntity<Page<StockTransactionResponse>> getTransactionsWithInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<StockTransactionResponse> response = stockTransactionService.getTransactionsWithInDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }


    /**
     * Reconcile stock for all products
     * GET /api/inventory/reconcile
     */
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    @GetMapping("/reconcile")
    public ResponseEntity<List<StockSummaryResponse>> reconcileStockProducts() {
        List<StockSummaryResponse> responses = stockReconciliationService.reconcileStockProducts();
        return ResponseEntity.ok(responses);
    }

    /**
     * Reconcile stock for specific product
     * GET /api/inventory/reconcile/{productId}
     */
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    @GetMapping("/reconcile/{productId}")
    public ResponseEntity<StockSummaryResponse> reconcileStockProduct(@PathVariable Long productId) {
        StockSummaryResponse response = stockReconciliationService.reconcileStockProduct(productId);
        return ResponseEntity.ok(response);
    }
}
