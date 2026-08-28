package com.inventorysaas.inventory_saas.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = " SKU is required")
    @Size(min = 2 ,max=50 ,message = "Products sku must be between 2 to 50 characters")
    @Pattern(regexp = "^[A-Z0-9-_]+$", message = "SKU must contain only uppercase letters, numbers, hyphens, and underscores")
    private String sku;

    @NotBlank(message = "Products name is required")
    @Size(min =2,max = 200 ,message = "Products name must be between 2 to 200 characters")
    private String name;

    @Size(max = 1000,message = "Description cannot exceed 10000 characters")
    private String description;

    @NotNull(message = "Category ID is required")
    @Positive(message = "Category ID must be positive")
    private Long categoryId;


    @Positive(message = "Supplier ID must be positive")
    private Long supplierId;

    @NotNull(message = "CurrentStock must be required")
    @Min(value = 0,message = "Stock cannot be negative")
    private Integer initialStock;

    @NotNull(message = "Minimum stock is required")
    @Min(value = 1,message = "Minimum stock must be at leat 1")
    private Integer minStockThreshold;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01",message = "Price must be at least 0.01")
    @Digits(integer = 8,fraction = 2,message = "Price must have at most 8 integer digits and 2 decimal places")
    private BigDecimal price;




}
