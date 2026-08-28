package com.inventorysaas.inventory_saas.Security.Filter;

import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Redis.Service.TenantCacheService;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.annotation.Order;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter using token bucket algorithm
 * Different limits per subscription plan
 * Order 3 -runs after correlation and logging filters
 */
@Component
@Order(3)
@Slf4j
public class RateLimitFilter implements Filter {

    @Autowired
    private TenantCacheService tenantCacheService;

    //Cache of rate limit bucket per tenant
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();  //this hash Map holds request based on thread so no conflict will occur


    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        //Skip rate limiting for public endpoint
        if (isPublicEndpoint(httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        String tenantId = TenantContextHolder.getCurrentTenantId();

        //Skip if no tenant context (eg:superadmin)
        if (tenantId == null || TenantContextHolder.isSuperAdmin()) {
            chain.doFilter(request, response);
            return;
        }
        /**
         * Get or create bucket for tenant
         * this method is the main thing which will check if c=bucket exist in concurrentHasMap and if not then it'll create a bucked based
         * on subscription plan of tenant and store it into the map with tenantId as key
         */

        Bucket bucket = resolveBucket(tenantId);

        /**
         * Try to consume a token
         * this method is critical:What it does is this tryConsume will check whether the bucket is greater or equal to
         * 1 or anything it added in the param eg:1,2  then it'll consume like (minus one token ) and remaining will be 99 if hundred tokens were available
         *then the bucket is alredy updated in concurrent hashmap cause the (Bucket bucket ) is only referencing the bucket object which is in concurrenthasmap
         */
        if (bucket.tryConsume(1)) {
            long availableTokens = bucket.getAvailableTokens();
            httpResponse.setHeader("X-Rate-Limit-Remaining", String.valueOf(availableTokens));
            chain.doFilter(request, response);
        } else {
            //Rate limit exceeded
            log.warn("Rate limit exceeded for tenant :{}", tenantId);

            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());//coudn't find to many request
            httpResponse.setHeader("X-Rate-Limit-Retry-After-Seconds", "60");
            httpResponse.getWriter().write("{\"error\":\"Rate limit exceeded.Please try again later.\"}");
        }

    }

    private Bucket resolveBucket(String tenantId) {
        return buckets.computeIfAbsent(tenantId, this::createBucket);
    }


    private Bucket createBucket(String tenantId) {
        //Get tenant subscription plan
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        SubscriptionPlan plan = tenant != null ? tenant.getSubscriptionPlan() : SubscriptionPlan.BASIC;

        io.github.bucket4j.Bandwidth limit = switch (plan) {
            case BASIC -> Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
            case INTERMEDIATE -> Bandwidth.classic(500, Refill.intervally(500, Duration.ofMinutes(1)));
            case ENTERPRISE -> Bandwidth.classic(2000, Refill.intervally(2000, Duration.ofMinutes(1)));
        };

        log.info("Create rate limit bucket for tenant {} with plan {} : {}request/minute", tenantId, plan, limit.getCapacity());

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Boolean isPublicEndpoint(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/api/auth/") ||
                uri.startsWith("/actuator/health") ||
                uri.startsWith("/api/super-admin/tenant");
    }
}
