package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Redis.Service.TenantCacheService;
import com.inventorysaas.inventory_saas.Repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import com.inventorysaas.inventory_saas.Service.AuthService;
import com.inventorysaas.inventory_saas.DTO.RegisterRequest;
import com.inventorysaas.inventory_saas.DTO.TenantWithAdminRequest;

@Slf4j
@Service
public class TenantService {
    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantCacheService tenantCacheService;

    @Autowired
    private AuthService authService;

    //  Create new tenant (by super admin)

    @Transactional
    public Tenant createTenant(String companyName, String email, SubscriptionPlan subscriptionPlan) {

        if (tenantRepository.existsByEmail(email)) {
            log.error("Email already exists");
        }
        String tenantId = generateTenantId(companyName);
        Tenant tenant = Tenant.builder()
                .companyName(companyName)
                .tenantId(tenantId)
                .email(email)
                .subscriptionPlan(subscriptionPlan)
                .isActive(true)
                .build();
        Tenant saved = tenantRepository.save(tenant);

        //cache it with plan specific ttl
        tenantCacheService.updateTenantCache(saved);

        log.info("Tenant created {} ({})", saved.getTenantId(), saved.getCompanyName());
        return saved;

    }

    @Transactional
    public Tenant createTenantWithAdmin(TenantWithAdminRequest request) {
        // 1. Create Tenant
        Tenant tenant = createTenant(request.getCompanyName(), request.getCompanyEmail(), request.getSubscriptionPlan());
        
        // 2. Create Admin
        RegisterRequest registerRequest = new RegisterRequest(
                request.getAdminUsername(),
                request.getAdminEmail(),
                request.getAdminPassword(),
                request.getAdminPhone()
        );
        
        authService.registerTenantAdmin(tenant.getTenantId(), registerRequest);
        
        return tenant;
    }

//    //get tenant by tenantId
//    @Transactional(readOnly = true)
//    public Tenant getTenantById(String tenantId) {

    /// /          Tenant tenant = tenantRepository.findByTenantId(tenantId).orElseThrow(() -> new RuntimeException("Tenant not found"));
    /// /        return tenant;
//
//        return tenantCacheService.getTenantCache(tenantId);
//    }

    // Generate unique tenant ID from company name
    public String generateTenantId(String companyName) {

        String base = companyName.toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_");
                
        base = base.substring(0, Math.min(base.length(), 20));
        
        String tenantId = "tenant" + "_" + base + "_" + UUID.randomUUID().toString().substring(0, 8);

        if (tenantRepository.existsByTenantId(tenantId)) {
            tenantId = "tenant" + "_" + base + "_" + UUID.randomUUID().toString().substring(0, 8);
        }
        return tenantId;
    }

//
//    //Get all tenants
//    public List<Tenant> getAllTenant() {
//        return tenantRepository.findAll();
//    }


}
