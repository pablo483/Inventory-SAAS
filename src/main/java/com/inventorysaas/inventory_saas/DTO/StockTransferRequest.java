package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.TransactionReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
/**
 * Request DTO for stock transfer between products
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTransferRequest {

    @NotNull(message = "Source Product Id is required")
    @Positive(message = "Product Id must be positive")
    private Long fromProductId;

    @NotNull(message = "Destination Product Id is required")
    @Positive(message = "Product Id must be positive")
    private Long toProductId;

    @NotNull(message = "quantity is required")
    @Positive(message = "Quantity must be positive ")
    private Integer quantity;

    @NotNull(message = "Reason for Transaction is required")
    private TransactionReason reason;

    @Size(max = 500,message = "Notes must be higher that 500 characters")
    private String notes;
}
