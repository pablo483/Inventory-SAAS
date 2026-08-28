package com.inventorysaas.inventory_saas.Mapper;

import com.inventorysaas.inventory_saas.DTO.ProductResponse;
import com.inventorysaas.inventory_saas.DTO.SupplierRequest;
import com.inventorysaas.inventory_saas.DTO.SupplierResponse;
import com.inventorysaas.inventory_saas.Entity.Category;
import com.inventorysaas.inventory_saas.Entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponse toResponse(Supplier supplier){
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .contactEmail(supplier.getContactEmail())
                .tenantId(supplier.getTenantId())
                .address(supplier.getAddress())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }

    public Supplier toEntity(SupplierRequest request,String tenantId){
        return Supplier.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .tenantId(tenantId)
                .build();
    }

    public void updateEntity(Supplier supplier,SupplierRequest supplierRequest){
        supplier.setName(supplierRequest.getName());
        supplier.setPhone(supplierRequest.getPhone());
        supplier.setContactEmail(supplierRequest.getContactEmail());
        supplier.setAddress(supplierRequest.getAddress());

    }
}
