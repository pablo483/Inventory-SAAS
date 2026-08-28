package com.inventorysaas.inventory_saas.Security.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

//cache configuration with redis,different TTL for different cache types
@Configuration
@EnableCaching
public class CacheConfig {

    @Autowired
    private RedisConfig redisConfig;


    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        // ✅ Use the shared factory — has JavaTimeModule + @class typing
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(redisConfig.redisObjectMapper());

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(jsonSerializer))   // ✅ not new GenericJackson2JsonRedisSerializer()
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfig = new HashMap<>();
        //Tenant config:Ttl based on subscription
        //cacheConfig.put("tenantConfig", defaultConfig.entryTtl(Duration.ofHours(4))); --> dont use this we have set manually ttl based on subscription plan
        //Product catalog (30 min frequently updated)
        // cacheConfig.put("products", defaultConfig.entryTtl(Duration.ofMinutes(30)));  // --> same with this
        //Categories:2 hours rarely updated
        //  cacheConfig.put("categories", defaultConfig.entryTtl(Duration.ofHours(2))); // --> same with this
        //Suppliers :1 hour
        // cacheConfig.put("suppliers", defaultConfig.entryTtl(Duration.ofHours(1))); // --> same with this

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfig)
                .build();
    }
}
