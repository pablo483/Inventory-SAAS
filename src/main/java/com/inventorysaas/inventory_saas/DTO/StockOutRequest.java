package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.TransactionReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockOutRequest {

    @NotNull(message = "Product Id is required")
    @Positive(message = "Product Id must be positive")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Reason for transaction is required")
    private TransactionReason reason;

    @Size(max = 500,message = "Notes should not exceed 500 characters")
    private String notes;
}
