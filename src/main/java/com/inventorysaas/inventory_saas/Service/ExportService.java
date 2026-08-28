package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.LowStockReportResponse;
import com.inventorysaas.inventory_saas.DTO.ProductSalesStat;
import com.inventorysaas.inventory_saas.DTO.SalesSummaryResponse;
import com.opencsv.CSVWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

/**
 * Service for exporting reports to  CSV
 */
@Service
@Slf4j
public class ExportService {

    /**
     * Export low stock report to CSV
     */
    public byte[] exportLowStockReportToCSV(LowStockReportResponse report) {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw);) {
            //Header
            String[] header = {
                    "SKU", "Product Name", "Category", "Supplier",
                    "Current Stock", "Min Threshold", "Shortfall",
                    "Unit Price", "Total Value", "Days Until Out"
            };

            writer.writeNext(header);

            //Data rows
            for (LowStockReportResponse.LowStockItem item : report.getItems()) {
                String[] row = {
                        item.getSku(),
                        item.getName(),
                        item.getCategoryName(),
                        item.getSupplierName(),
                        item.getCurrentStock().toString(),
                        item.getMinStockThreshold().toString(),
                        item.getShortFall().toString(),
                        item.getTotalValue().toString(),
                        item.getDaysUntilOutOfStock().toString()
                };

                writer.writeNext(row);
            }
            writer.flush();
            log.debug("Exported low stock report to CSV:{} products", report.getItems().size());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error exporting low stock report to CSV :{}", e.getMessage(), e);
            throw new RuntimeException("failed to export report");
        }
    }

    /**
     * export sales summary to csv
     */
    public byte[] exportSalesSummaryToCSV(SalesSummaryResponse report) {
        try (ByteArrayOutputStream bios = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(bios, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw);) {

            //Summary Section
            writer.writeNext(new String[]{"Sales Summary Report"});
            writer.writeNext(new String[]{"Period", report.getStartDate() + " to " + report.getEndDate()});
            writer.writeNext(new String[]{"Total Transactions", report.getTotalTransactions().toString()});
            writer.writeNext(new String[]{"Total Quantity Sold", report.getTotalQuantitySold().toString()});
            writer.writeNext(new String[]{"Total Sales Value", report.getTotalSalesValue().toString()});
            writer.writeNext(new String[]{"Average Transaction Value", report.getAverageTransactionValue().toString()});
            writer.writeNext(new String[]{});//Blank Line

            //Products Details Header
            writer.writeNext(new String[]{
                    "SKU", "Product Name", "Category", "Quantity Sold",
                    "Total Sales", "Transaction Count", "Average price"
            });

            //Product Data
            for (ProductSalesStat product : report.getTopSellingProducts()) {
                String[] row = {
                        product.getSku(),
                        product.getName(),
                        product.getCategoryName(),
                        product.getQuantitySold().toString(),
                        product.getTotalSalesValue().toString(),
                        product.getTransactionCount().toString(),
                        product.getAveragePrice().toString()
                };
                writer.writeNext(row);
            }
            writer.flush();
            log.debug("Exported Sales Summary report to CSV :{} products", report.getTopSellingProducts().size());
            return bios.toByteArray();
        } catch (Exception e) {
            log.error("Error Exporting Sales Summary to CSV :{}", e.getMessage(), e);
            throw new RuntimeException("Failed to export Report");
        }
    }
}
