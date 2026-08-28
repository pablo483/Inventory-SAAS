package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.TransactionReason;
import com.inventorysaas.inventory_saas.Enum.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for stock transaction
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransactionResponse {

private Long id;
private Long productId;
private String productName;
private String productSku;
private TransactionType transactionType;
private Integer stockBefore;
private Integer stockAfter;
private TransactionReason reason;
private Integer quantity;
private LocalDateTime transactionDate;
private String performedBy;
private String note;
}
