package com.inventorysaas.inventory_saas.Tenant.Config;

import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
/**
 * Utility to enable Hibernate tenant filter
 */
@Component
@Slf4j
public class TenantConfig {



    public static void enableFilter(EntityManager entityManager){
        String tenantId = TenantContextHolder.getCurrentTenantId();

        if (tenantId==null || TenantContextHolder.isSuperAdmin()){
            log.trace("Tenant filter not applied - Super admin or no tenant context");
            return;
        }

        Session session = entityManager.unwrap(Session.class);
        session.enableFilter("tenantFilter")
                .setParameter("tenantId",tenantId);

        log.trace("Tenant filter enabled for tenantId :{}",tenantId);
    }
}
