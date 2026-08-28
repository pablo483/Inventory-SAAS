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
public class StockInRequest {

    @NotNull(message = "Product Id is required")
    @Positive(message = "Product Id must be positive")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Reason is required")
    private TransactionReason reason;

    @Positive(message = "Supplier id must be positive")
    private Long supplierId;

    @Size(max = 500,message = "Notes cannot exceed 500 characters")
    private String notes;



}
