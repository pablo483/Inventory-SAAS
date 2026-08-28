package com.inventorysaas.inventory_saas.Mapper;

import com.inventorysaas.inventory_saas.DTO.ProductRequest;
import com.inventorysaas.inventory_saas.DTO.ProductResponse;
import com.inventorysaas.inventory_saas.Entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

//For response of productResponse
    public ProductResponse toResponse(Product product) {
        ProductResponse.CategoryInfo categoryInfo = null;
        if (product.getCategory() != null) {
            categoryInfo = ProductResponse.CategoryInfo.builder()
                    .id(product.getCategory().getId())
                    .name(product.getCategory().getName())
                    .build();
        }

        ProductResponse.SupplierInfo supplierInfo = null;
        if (product.getSupplier() != null) {
            supplierInfo = ProductResponse.SupplierInfo.builder()
                    .id(product.getSupplier().getId())
                    .name(product.getSupplier().getName())
                    .build();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .isLowStock(product.isLowStock())
                .currentStock(product.getCurrentStock())
                .minThresholdStock(product.getMinStockThreshold())
                .category(categoryInfo)
                .supplier(supplierInfo)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();

    }

    //for Entity Product
    public Product toEntity(ProductRequest request, String tenantId) {
        return Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .currentStock(request.getInitialStock())
                .minStockThreshold(request.getMinStockThreshold())
                .tenantId(tenantId)
                .build();
    }

    //For updating ProductEntity
    public void updateEntity(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setMinStockThreshold(request.getMinStockThreshold());
        product.setDescription(request.getDescription());
        // Note: currentStock is NOT updated here - only via stock transactions

    }
}
