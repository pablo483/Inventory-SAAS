package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.CategoryRequest;
import com.inventorysaas.inventory_saas.DTO.CategoryResponse;
import com.inventorysaas.inventory_saas.Service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for category management
 * Requires TENANT_ADMIN or TENANT_USER role
 */
@RestController
@RequestMapping("/api/categories")
@PreAuthorize("hasAnyRole('TENANT_ADMIN', 'TENANT_USER')")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    //Create new Tenant

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(201).body(response);
    }

    //Get All the categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> response = categoryService.getAllCategories();
        return ResponseEntity.ok(response);
    }

    //Get Category By id
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    //Update CategoryBu id
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    //Delete category by id
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteCategoryById(@PathVariable Long id) {
        categoryService.deleteCategoryById(id);
        return ResponseEntity.noContent().build();
    }
}
