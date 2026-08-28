package com.inventorysaas.inventory_saas.Mapper;

import com.inventorysaas.inventory_saas.DTO.CategoryRequest;
import com.inventorysaas.inventory_saas.DTO.CategoryResponse;
import com.inventorysaas.inventory_saas.Entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category){
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .tenantId(category.getTenantId())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public Category toEntity(CategoryRequest request,String tenantId){
        return Category.builder()
                .name(request.getName())
                .tenantId(tenantId)
                .description(request.getDescription())
                .build();
    }

    public void updateEntity(Category category,CategoryRequest request){
        category.setName(request.getName());
        category.setDescription(request.getDescription());
    }
}
