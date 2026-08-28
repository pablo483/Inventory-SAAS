package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.DTO.ProductRequest;
import com.inventorysaas.inventory_saas.DTO.ProductResponse;
import com.inventorysaas.inventory_saas.Service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//need testing this class
@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasAnyRole('TENANT_ADMIN','TENANT_USER')")
public class ProductController {

    @Autowired
    private ProductService productService;

    //create product
    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(201).body(product);

    }

    /**
     * Get all products with pagination
     * GET /api/products?page=0&size=20&sort=name,asc
     */
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size,
                                                                        @RequestParam(defaultValue = "name") String sortBy,
                                                                        @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<ProductResponse> response = productService.getAllProducts(pageable);
        return ResponseEntity.ok(response);

    }

    //Get Product By id
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    //Get products By CategoryId(paging new)
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByCategoryId(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @PathVariable Long categoryId
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<ProductResponse> response = productService.getProductsByCategoryId(categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    //Get Low Stock Products
    @GetMapping("/low-stock")
    public ResponseEntity<PageResponse<ProductResponse>> getLowStockProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<ProductResponse> response = productService.getLowStockProducts(pageable);
        return ResponseEntity.ok(response);
    }

    //products below threshold
    @GetMapping("/below-threshold/{value}")
    public ResponseEntity<List<ProductResponse>> getProductsBelowThreshold(@PathVariable Integer value) {
        List<ProductResponse> productsBelowThreshold = productService.getProductsBelowThreshold(value);
        return ResponseEntity.ok(productsBelowThreshold);
    }

    //Update product
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<ProductResponse> updateProductById(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse productResponse = productService.updateProductsById(id, request);
        return ResponseEntity.ok(productResponse);
    }


    //Delete Product
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteProductById(@PathVariable Long id) {
        productService.deleteProductById(id);
        return ResponseEntity.noContent().build();

    }

//    //Tets
//    @GetMapping("/all")
//    public ResponseEntity<List<ProductResponse>> getAllProducts() {
//        List<ProductResponse> allProducts = productService.getAllProducts();
//        return ResponseEntity.ok(allProducts);
//    }

}
