package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.CategoryResponse;
import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.DTO.SupplierRequest;
import com.inventorysaas.inventory_saas.DTO.SupplierResponse;
import com.inventorysaas.inventory_saas.Service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@PreAuthorize("hasAnyRole('TENANT_ADMIN','TENANT_USER')")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;


    //Create Supplier
    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.status(201).body(response);
    }

    //Get all suppliers
    @GetMapping
    public ResponseEntity<PageResponse<SupplierResponse>> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<SupplierResponse> response = supplierService.getAllSuppliers(pageable);
        return ResponseEntity.ok(response);
    }

    //Get Suppliers by id
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        SupplierResponse response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(response);
    }

    //Update Supplier by id
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<SupplierResponse> updateSupplierById(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.updateSupplierById(id, request);
        return ResponseEntity.ok(response);
    }

    //Delete supplier by id
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteSupplierById(@PathVariable Long id) {
        supplierService.deleteSupplierById(id);
        return ResponseEntity.noContent().build();
    }
}
