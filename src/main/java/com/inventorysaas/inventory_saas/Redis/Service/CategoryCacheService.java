package com.inventorysaas.inventory_saas.Redis.Service;

import com.inventorysaas.inventory_saas.Entity.Category;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Repository.CategoryRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class CategoryCacheService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CONFIG = "categoryConfig::";

    public Category getCategoryCache(String tenantId, Long categoryId) {
        String key = CONFIG + tenantId + ":" + categoryId;
        Category category = (Category) redisTemplate.opsForValue().get(key);
        if (category != null) {
            return category;
        }
        log.info("Missed caching for category:{} -  fetching from db ", categoryId);
        category = categoryRepository.findById(categoryId).orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + categoryId));

        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();
        if (subscriptionPlan != null) {
            Long ttlPlan = TenantCacheService.getTtlPlan(subscriptionPlan);
            redisTemplate.opsForValue().set(key, category, ttlPlan, TimeUnit.SECONDS);
        }
        return category;
    }

    public Category updateCategoryCache(String tenantId, Category category) {

        Category saved = categoryRepository.save(category);

        String key = CONFIG + tenantId + ":" + saved.getId();
        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();
        if (subscriptionPlan != null) {
            Long ttlPlan = TenantCacheService.getTtlPlan(subscriptionPlan);
            redisTemplate.opsForValue().set(key, saved, ttlPlan, TimeUnit.SECONDS);
            log.info("Updated cache for category:{}", saved.getId());
        }
        return saved;
    }

    public void evictCategoryCache(String tenantId, Long categoryId) {
        String key = CONFIG + tenantId + ":" + categoryId;

        redisTemplate.delete(key);
        log.info("Evicted cache for category:{}", categoryId);
    }
}
