package com.inventorysaas.inventory_saas.Tenant.Config;

import com.inventorysaas.inventory_saas.Tenant.Interceptor.MetricsInterceptor;
import com.inventorysaas.inventory_saas.Tenant.Interceptor.TenantInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration
 * Registers TenantInterceptor for all requests
 */
@Component
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private TenantInterceptor tenantInterceptor;

    @Autowired
    private MetricsInterceptor metricsInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/actuator/**");

        //add metrics interceptor
        registry.addInterceptor(metricsInterceptor)
                .addPathPatterns("/api/**");
    }
}
