package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.CategoryRequest;
import com.inventorysaas.inventory_saas.DTO.CategoryResponse;
import com.inventorysaas.inventory_saas.Entity.Category;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Exception.UserAlreadyExistException;
import com.inventorysaas.inventory_saas.Mapper.CategoryMapper;
import com.inventorysaas.inventory_saas.Redis.Service.CategoryCacheService;
import com.inventorysaas.inventory_saas.Repository.CategoryRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private CategoryCacheService categoryCacheService;

    //create new Tenant
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {

        String tenantId = TenantContextHolder.getCurrentTenantId();

        if (categoryRepository.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new UserAlreadyExistException("Category with " + request.getName() + "already exist");
        }

        Category category = categoryMapper.toEntity(request, tenantId);
        //update in category and save it to db too
        Category saved = categoryCacheService.updateCategoryCache(tenantId,category);
        log.info("Category created : {} for tenant : {}", saved.getName(), tenantId);
        return categoryMapper.toResponse(saved);


    }

    //Get all Categories
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        List<Category> categories = categoryRepository.findByTenantId(tenantId);

        return categories.stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    //Get Category By Id
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Category category = categoryCacheService.getCategoryCache(tenantId,id);

        // Verify tenant ownership (belt and suspenders - Hibernate filter should handle this)
        if (!category.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Category  not found by id :" + id);
        }
        return categoryMapper.toResponse(category);
    }

    //Update Category By Id
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Category category = categoryCacheService.getCategoryCache(tenantId,id);
        //Validate tenant ownership
        if (!category.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Category not found with id :" + id);
        }
        // Check if new name conflicts with existing category
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new UserAlreadyExistException("Category with name :" + request.getName() + " already exists");
        }

        categoryMapper.updateEntity(category, request);
        //updating cache in redis and updating db
        Category saved = categoryCacheService.updateCategoryCache(tenantId,category);
        log.info("Category updated:{} for tenant :{}", saved.getId(), tenantId);
        return categoryMapper.toResponse(saved);

    }


    //Delete  Category By Id
    @Transactional
    public void deleteCategoryById(Long id) {

        String tenantId = TenantContextHolder.getCurrentTenantId();

        Category category = categoryCacheService.getCategoryCache(tenantId,id);

        if (!category.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Category not found with id:" + id);
        }
        categoryRepository.delete(category);
        //deleting category from cache
        categoryCacheService.evictCategoryCache(tenantId,id);
        log.info("Category deleted :{} for tenant :{}", id, tenantId);
    }

}
