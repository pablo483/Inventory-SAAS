package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.CreateUserRequest;
import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.DTO.UpdateUserRequest;
import com.inventorysaas.inventory_saas.DTO.UserResponse;
import com.inventorysaas.inventory_saas.Service.TenantUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/users")
@PreAuthorize("hasAnyRole('TENANT_ADMIN')")
public class TenantUserController {

    @Autowired
    private TenantUserService tenantUserService;

    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getAllTenantUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<UserResponse> response = tenantUserService.getAllTenantUsers(searchTerm, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createTenantUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = tenantUserService.createTenantUser(request);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateTenantUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse response = tenantUserService.updateTenantUser(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenantUser(@PathVariable Long id) {
        tenantUserService.deleteTenantUser(id);
        return ResponseEntity.noContent().build();
    }
}
