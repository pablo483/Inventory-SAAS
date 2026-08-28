package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSummaryResponse {

    private Long productId;
    private String sku;
    private String name;
    private Integer currentStock;
    private Integer totalStockIn;
    private Integer totalStockOut;
    private Integer calculatedStock;  //should match currentStock
    private Boolean isReconciled;
    private BigDecimal totalValue;
}
