package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.LoginRequest;
import com.inventorysaas.inventory_saas.DTO.LoginResponse;
import com.inventorysaas.inventory_saas.DTO.RegisterRequest;
import com.inventorysaas.inventory_saas.DTO.RegisterResponse;
import com.inventorysaas.inventory_saas.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }


    /**
     * Register tenant admin (after tenant creation)
     * POST /api/auth/register-admin/{tenantId}
     */
    @PostMapping("/register-admin/{tenantId}")
    public ResponseEntity<RegisterResponse> registerTenantAdmin(@PathVariable String tenantId, @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response = authService.registerTenantAdmin(tenantId, request);
        return ResponseEntity.status(201).body(response);
    }

    //Register tenant user
    @PostMapping("/register-user/{tenantId}")
    public ResponseEntity<RegisterResponse> registerTenantUser(@PathVariable String tenantId, @Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.registerTenantUser(tenantId, request);
        return ResponseEntity.status(201).body(response);

    }

    @PostMapping("/register-super-admin")
    public ResponseEntity<RegisterResponse> registerTenantSuperAdmin(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.registerTenantSuperAdmin(request);
        return ResponseEntity.status(201).body(response);

    }




}
