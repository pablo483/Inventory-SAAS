package com.inventorysaas.inventory_saas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.retry.annotation.EnableRetry;

@EnableJpaAuditing
@EnableRetry
@SpringBootApplication
@EnableCaching
public class MultiTenantInventorySaasApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiTenantInventorySaasApplication.class, args);
    }

}
