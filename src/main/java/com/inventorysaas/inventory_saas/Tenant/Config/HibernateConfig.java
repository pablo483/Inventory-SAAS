package com.inventorysaas.inventory_saas.Tenant.Config;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Aspect
@Configuration
public class HibernateConfig {

    @Autowired
    private EntityManager entityManager;

     // Enable tenant filter before any repository method execution
    @Before("execution(* com.inventorysaas.inventory_saas.Repository.*.*(..))")
    public void  enableFilter(){
        TenantConfig.enableFilter(entityManager);
    }
}
