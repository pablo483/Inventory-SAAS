package com.inventorysaas.inventory_saas.Redis.Service;

import com.inventorysaas.inventory_saas.Entity.Tenant;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Repository.TenantRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class TenantCacheService {


    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CONFIG = "tenantConfig::";


    //get tenant with automatic caching
    //Use @Cachable so Spring handles it , but we set custom ttl manually
    //@Cacheable(value = "tenantConfig", key = "#tenantId")
    public Tenant getTenantCache(String tenantId) {
        String key = CONFIG + tenantId;
        Tenant tenant = (Tenant) redisTemplate.opsForValue().get(key);

        if (tenant != null) {
            return tenant;
        }
        log.info("Missed caching for tenant :{} -fething from db", tenantId);
        tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();
        if (subscriptionPlan != null && tenant != null) {
            Long ttlPlan = getTtlPlan(subscriptionPlan);
            if (tenantId != null) {
                redisTemplate.opsForValue().set(key, tenant, ttlPlan, TimeUnit.SECONDS);
            }
        }
        return tenant;

    }

    //update tenant and refresh cache
    //@CachePut(value = "tenantConfig", key = "#tenant.tenantId")
    public void updateTenantCache(Tenant tenant) {
        Tenant updated = tenantRepository.save(tenant);
        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();
        if (subscriptionPlan != null) {
            Long ttlPlan = getTtlPlan(subscriptionPlan);

            String key = CONFIG + updated.getTenantId();
            redisTemplate.opsForValue().set(key, updated, ttlPlan, TimeUnit.SECONDS);
            log.info("Updated cache for tenant :{}", tenant.getTenantId());
        }
    }

    //Evict tenant from cache
    // @CacheEvict(value = "tenantConfig", key = "#tenantId")
    public void evictTenantCache(String tenantId) {
        String key = CONFIG + tenantId;
        redisTemplate.delete(key);
        log.info("Successfully deleted manual cache key: {}", key);
        log.debug("Evicted tenant config cache for :{}", tenantId);
    }


//    /**
//     * Set custom TTL for cached tenant based on subscription plan
//     */
//    private void setTtlForTenant(String tenantId, SubscriptionPlan plan) {
//        try {
//            String key = "tenantConfig::" + tenantId;
//            Long ttl = getTtlPlan(plan);
//
//            //set expiration on the key Spring cache created
//            redisTemplate.expire(key, ttl, TimeUnit.SECONDS);
//
//            log.info("Set TTL for tenant :{} ({}) :{}s", tenantId, plan, ttl);
//        } catch (Exception e) {
//            log.error("Error setting ttl for tenant {}:{}", tenantId, e.getMessage());
//        }
//
//
//    }

    //get ttl based on subscription plan
    public static Long getTtlPlan(SubscriptionPlan plan) {
        return switch (plan) {
            case BASIC -> 3600L; //1 hour
            case INTERMEDIATE -> 7200L; //2 hour
            case ENTERPRISE -> 14400L;//4 hours
        };
    }

}
