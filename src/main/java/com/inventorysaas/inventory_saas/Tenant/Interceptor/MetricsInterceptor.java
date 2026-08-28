package com.inventorysaas.inventory_saas.Tenant.Interceptor;

import com.inventorysaas.inventory_saas.Service.MetricsService;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to tract api calls for metrics
 */
@Component
public class MetricsInterceptor implements HandlerInterceptor {
 @Autowired
 private MetricsService metricsService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        //Only Tracks api call with tenant context
        String tenantId = TenantContextHolder.getCurrentTenantId();
        if (tenantId!=null){
            metricsService.incrementApiCallCounter();
        }
        return true;
    }


}
