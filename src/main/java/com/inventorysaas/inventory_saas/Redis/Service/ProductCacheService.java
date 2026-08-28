package com.inventorysaas.inventory_saas.Redis.Service;

import com.inventorysaas.inventory_saas.Entity.Product;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
@Service
@Slf4j
public class ProductCacheService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CONFIG= "productConfig::";


    //get Product with automatic caching
    //Use @Cachable so spring handles it -but use ttl setup for manually
    // @Cacheable(value = "productConfig", key = "#tenantId"+ ':' + "#productId")
    public Product getProductCache(String tenantId, Long productId) {
        String key = CONFIG + tenantId + ":" + productId;
        Product product = (Product) redisTemplate.opsForValue().get(key);
        if (product != null) {
            return product;
        }
        log.info("Missed caching for product :{} - fetching product from DB", productId);
        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();

        product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));

        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found by id " + productId);
        }

        if (subscriptionPlan != null) {
            Long ttlPlan = TenantCacheService.getTtlPlan(subscriptionPlan);
            redisTemplate.opsForValue().set(key, product, ttlPlan, TimeUnit.SECONDS);
        }
        return product;

    }

    //update product  and refresh in cache
    // @CachePut(value = "productConfig", key ="#tenantId"+ ':' + "#product.productId")(one cache cannot be called in from same class of method )
    public Product updateProductCache(String tenantId, Product product) {
        SubscriptionPlan subscriptionPlan = TenantContextHolder.getSubscriptionPlan();
        Product updated = productRepository.saveAndFlush(product);

        //updating ttl based on new plan
        // setTtlForProduct(tenantId, updated.getId(), subscriptionPlan);  //(this will not work like its setting the expiration time to the key which is not in redis add and the return will replace completely)
        if (subscriptionPlan != null) {
            Long ttlPlan = TenantCacheService.getTtlPlan(subscriptionPlan);
            String key = CONFIG + tenantId + ":" + updated.getId();

            redisTemplate.opsForValue().set(key, updated, ttlPlan, TimeUnit.SECONDS);
            log.info("updated cache for product :{} ", product.getId());
        }
        return updated;

    }

    //delete product cache
    //@CacheEvict(value = "productConfig", key = "#tenantId" + ':' + "#productId")
    public void evictCacheProduct(String tenantId, Long productId) {
        String key = CONFIG + tenantId + ":" + productId;
        redisTemplate.delete(key);

        log.info("Evicted cache config for product:{}", productId);
    }


//    //Set ttl for product
//    public void setTtlForProduct(String tenantId,Long productId, SubscriptionPlan plan) {
//        try {
//
//            String key = "productConfig::"+tenantId+':'+ productId;
//            //get ttl plan
//            Long ttl = TenantCacheService.getTtlPlan(plan);
//
//            //set expiration on the key cache created
//            redisTemplate.expire(key, ttl, TimeUnit.SECONDS);
//
//            log.info("Set Ttl for product :{} ({}) -{}s", productId, plan, ttl);
//        } catch (Exception e) {
//            log.error("Error setting ttl for product {} :{}", productId, e.getMessage());
//        }
//    }


}
