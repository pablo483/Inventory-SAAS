package com.inventorysaas.inventory_saas.Controller;
/**
 * SuperAdmin Controller enhanced
 */

import com.inventorysaas.inventory_saas.DTO.*;
import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Service.SuperAdminService;
import com.inventorysaas.inventory_saas.Service.SystemMonitoringService;
import com.inventorysaas.inventory_saas.Service.TenantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {
    @Autowired
    private TenantService tenantService;

    @Autowired
    private SuperAdminService superAdminService;

    @Autowired
    private SystemMonitoringService systemMonitoringService;

    @PostMapping("/tenant")
    public ResponseEntity<TenantCreationResponse> createTenant(@Valid @RequestBody TenantCreationRequest request) {

        Tenant tenant = tenantService.createTenant(request.getCompanyName(), request.getEmail(), request.getSubscriptionPlan());

        TenantCreationResponse response = TenantCreationResponse.builder()
                .tenantId(tenant.getTenantId())
                .email(tenant.getEmail())
                .companyName(tenant.getCompanyName())
                .subscriptionPlan(tenant.getSubscriptionPlan().name())
                .message("Tenant created successfully,use api/auth/register-admin/" + tenant.getTenantId() + "to create tenant admin")
                .build();
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/tenant-with-admin")
    public ResponseEntity<TenantCreationResponse> createTenantWithAdmin(@Valid @RequestBody TenantWithAdminRequest request) {
        Tenant tenant = tenantService.createTenantWithAdmin(request);
        
        TenantCreationResponse response = TenantCreationResponse.builder()
                .tenantId(tenant.getTenantId())
                .email(tenant.getEmail())
                .companyName(tenant.getCompanyName())
                .subscriptionPlan(tenant.getSubscriptionPlan().name())
                .message("Tenant and Admin created successfully in a single transaction.")
                .build();
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Get all tenant with pagination & filtering
     * GET /api/super-admin/tenants?page=0&size=20&searchTerm=acme&subscriptionPlan=PREMIUM
     */

    @GetMapping("/tenants")
    public ResponseEntity<Page<TenantDetailResponse>> getAllTenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) SubscriptionPlan subscriptionPlan,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        TenantSearchRequest tenantSearchRequest = new TenantSearchRequest(searchTerm, subscriptionPlan, isActive, sortBy, sortDirection);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, pageSize);

        Page<TenantDetailResponse> tenants = superAdminService.getAllTenants(tenantSearchRequest, pageable);
        return ResponseEntity.ok(tenants);

    }


    /**
     * Get Tenant Details
     * Get api/super-admin/tenant/{tenantId}
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<TenantDetailResponse> getTenantDetails(@PathVariable String tenantId) {

        TenantDetailResponse tenantDetails = superAdminService.getTenantDetails(tenantId);
        return ResponseEntity.ok(tenantDetails);
    }


    /**
     * Update tenant
     * PUT api/super-admin/tenant/{tenantId}
     */
    @PutMapping("/tenant/{tenantId}")
    public ResponseEntity<TenantDetailResponse> updateTenant(@PathVariable String tenantId, @RequestBody UpdateTenantRequest request) {
        TenantDetailResponse tenantDetailResponse = superAdminService.updateTenant(tenantId, request);
        return ResponseEntity.ok(tenantDetailResponse);
    }

    /**
     * Change subscription Plan
     * POST api/super-admin/tenant/{tenantId}/change-plan
     */
    @PostMapping("/tenant/{tenantId}/change-plan")
    public ResponseEntity<TenantDetailResponse> changePlan(@PathVariable String tenantId, @RequestBody ChangePlanRequest request) {
        TenantDetailResponse tenantDetailResponse = superAdminService.changeTenantPlan(tenantId, request);
        return ResponseEntity.ok(tenantDetailResponse);
    }

    /**
     * Activate tenant
     * POST api/super-admin/tenant/{tenantId}/activate
     */
    @PostMapping("/tenant/{tenantId}/activate")
    public ResponseEntity<Void> activateTenant(@PathVariable String tenantId) {
        superAdminService.activateTenant(tenantId);
        return ResponseEntity.ok().build();
    }

    /**
     * Deactivate tenant
     * POST api/super-admin/tenant/{tenantId}/deactivate
     */
    @PostMapping("/tenant/{tenantId}/deactivate")
    public ResponseEntity<Void> deactivateTenant(@PathVariable String tenantId) {
        superAdminService.deactivateTenant(tenantId);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete tenant
     * DELETE api/super-admin/tenant/{tenantId}/delete
     */
    @DeleteMapping("/tenant/{tenantId}/delete")
    public ResponseEntity<Void> deleteTenant(@PathVariable String tenantId) {
        superAdminService.deleteTenant(tenantId);
        return ResponseEntity.ok().build();
    }
    //==============================Global Metrics=========================================

    /**
     * Get Global System Metrics
     * GET api/super-admin/metrics/global
     */
    @GetMapping("/metrics/global")
    public ResponseEntity<GlobalMetricsResponse> getGlobalMetrics() {
        GlobalMetricsResponse globalMetrics = superAdminService.getGlobalMetrics();
        return ResponseEntity.ok(globalMetrics);
    }

    //================================User Management======================================

    /**
     * Get all user across tenants
     * GET api/super-admin/users?page=0&pageSize=50
     */
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "50") int size) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size);
        Page<User> allUsers = superAdminService.getAllUsers(pageable);
        return ResponseEntity.ok(allUsers);

    }

    /**
     * Update user
     * PUT api/super-admin/users/{userId}
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long userId, @RequestBody UpdateUserRequest request) {
        UserResponse response = superAdminService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user
     * DELETE api/super-admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        superAdminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    //================================System Health==========================================

    /**
     * Check System Health
     * GET api/super-admin/health
     */
    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> checkSystemHealth() {
        SystemHealthResponse systemHealthResponse = systemMonitoringService.checkSystemHealth();
        return ResponseEntity.ok(systemHealthResponse);
    }


//    /**
//     * Get tenant details
//     * GET /api/super-admin/tenant/{tenantId}
//     */
//    @GetMapping("/tenant/{tenantId}")
//    public ResponseEntity<Tenant> getTenantById(@PathVariable String tenantId) {
//
//        Tenant tenant = tenantService.getTenantById(tenantId);
//        return ResponseEntity.ok(tenant);
//    }

//    @GetMapping
//    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
//    public List<Tenant> getAllTenant() {
//        return tenantService.getAllTenant();
//    }

}
