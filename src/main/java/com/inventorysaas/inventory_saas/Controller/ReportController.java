package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.LowStockReportResponse;
import com.inventorysaas.inventory_saas.DTO.SalesSummaryResponse;
import com.inventorysaas.inventory_saas.DTO.TenantUsageMetricsResponse;
import com.inventorysaas.inventory_saas.Service.ExportService;
import com.inventorysaas.inventory_saas.Service.MetricsService;
import com.inventorysaas.inventory_saas.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Controller for reports & metrics
 */
@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('TENANT_USER','TENANT_ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ExportService exportService;

    @Autowired
    private MetricsService metricsService;

    /**
     * Get low stock report
     */
    @GetMapping("/low-stock")
    public ResponseEntity<LowStockReportResponse> getLowStockReport(@RequestParam(required = false) Integer threshold) {
        LowStockReportResponse lowStockReportResponse = reportService.generateLowStockReport(threshold);
        return ResponseEntity.ok(lowStockReportResponse);
    }

    /**
     * Export low stock report to csv
     */
    @GetMapping("/low-stock/export")
    public ResponseEntity<byte[]> exportLowStockReport(@RequestParam(required = false) Integer threshold) {
        LowStockReportResponse lowStockReport = reportService.generateLowStockReport(threshold);
        byte[] csv = exportService.exportLowStockReportToCSV(lowStockReport);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=low-stock-report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    /**
     * Get sales summary report
     */
    @GetMapping("/sales-summary")
    public ResponseEntity<SalesSummaryResponse> getSalesSummaryReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        SalesSummaryResponse salesSummaryResponse = reportService.generateSalesSummaryReport(startDate, endDate);
        return ResponseEntity.ok(salesSummaryResponse);
    }

    /**
     * Export sales summary to csv
     */
    @GetMapping("/sales-summary/export")
    public ResponseEntity<byte[]> exportSalesSummaryReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        SalesSummaryResponse salesSummaryReport = reportService.generateSalesSummaryReport(startDate, endDate);
        byte[] csv = exportService.exportSalesSummaryToCSV(salesSummaryReport);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-summary-report.scv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    /**
     * Get tenant usage metrics
     */
    @GetMapping("/usage-metrics")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<TenantUsageMetricsResponse> getUsageMetrics(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        TenantUsageMetricsResponse tenantUsageMetrics = metricsService.getTenantUsageMetrics(startDate, endDate);
        return ResponseEntity.ok(tenantUsageMetrics);
    }

    /**
     * Manually calculate daily metrics for today (normally run by scheduler)
     */
    @GetMapping("/calculate-metrics")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<String> calculateMetricsManually() {
        metricsService.calculateDailyMetrics(com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder.getCurrentTenantId(), LocalDate.now());
        return ResponseEntity.ok("Metrics calculated for today");
    }
}
