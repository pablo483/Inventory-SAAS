package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.SystemHealthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for System Health Monitoring
 */
@Service
@Slf4j
public class SystemMonitoringService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * Check OverAll System Health
     */

    public SystemHealthResponse checkSystemHealth() {

        Map<String, SystemHealthResponse.ComponentHealth> components = new HashMap<>();

        //check database
        SystemHealthResponse.ComponentHealth dbHealth = checkDatabaseHealth();
        components.put("database", dbHealth);

        //check Redis
        SystemHealthResponse.ComponentHealth redisHealth = checkRedisHealth();
        components.put("redis", redisHealth);

        //Determine overAll status
        String overAllStatus = "UP";
        if (components.values().stream().anyMatch(componentHealth -> "DOWN".equals(componentHealth.getStatus()))) {
            overAllStatus = "DOWN";
        } else if (components.values().stream().anyMatch(componentHealth -> "DEGRADED".equals(componentHealth.getStatus()))) {
            overAllStatus = "DEGRADED";
        }

        //building and returning  the response
        return SystemHealthResponse.builder()
                .status(overAllStatus)
                .timestamp(LocalDateTime.now())
                .components(components)
                .build();
    }

    /**
     * check database connectivity & performance
     */
    private SystemHealthResponse.ComponentHealth checkDatabaseHealth() {
        long startTime = System.currentTimeMillis();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long responseTimeMs = System.currentTimeMillis() - startTime;
            String status = responseTimeMs < 100 ? "UP" : "DEGRADED";
            String details = String.format("Query executed in %dms", responseTimeMs);
            return SystemHealthResponse.ComponentHealth.builder()
                    .status(status)
                    .responseTimeMs(responseTimeMs)
                    .description(details)
                    .build();
        } catch (Exception e) {
            log.error("Database Health check failed :{}", e.getMessage());
            return SystemHealthResponse.ComponentHealth.builder()
                    .status("DOWN")
                    .description("Database connection Failed :{}" + e.getMessage())
                    .responseTimeMs(System.currentTimeMillis() - startTime)
                    .build();

        }
    }

    /**
     * Check Redis Connectivity & Performance
     */

    private SystemHealthResponse.ComponentHealth checkRedisHealth() {
        long startTime = System.currentTimeMillis();
        try {
            redisTemplate.opsForValue().set("health:check","ok");
            Object result = redisTemplate.opsForValue().get("health:check");
            long responseTimeMS = System.currentTimeMillis() - startTime;
            if ("ok".equals(result)){

                String status = responseTimeMS < 50 ? "UP" : "DEGRADED";
                String details = String.format("Ping successful in %dms", responseTimeMS);
                return SystemHealthResponse.ComponentHealth.builder()
                        .status(status)
                        .description(details)
                        .responseTimeMs(responseTimeMS)
                        .build();
            }else {
                return SystemHealthResponse.ComponentHealth.builder()
                        .status("DEGRADED")
                        .description("Redis is responding but with unexpected result")
                        .responseTimeMs(responseTimeMS)
                        .build();
            }
        }catch (Exception e){
            log.error("Redis health check failed :{}",e.getMessage());
            return SystemHealthResponse.ComponentHealth.builder()
                    .status("DOWN")
                    .description("Redis connection failed "+e.getMessage())
                    .responseTimeMs(System.currentTimeMillis()-startTime)
                    .build();
        }
    }

}
