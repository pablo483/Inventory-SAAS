package com.inventorysaas.inventory_saas.Tenant.Interceptor;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Security.Jwt.JwtUtil;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContext;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

//Interceptor to extract tenantId from Jwt and set it in TenantContext
//Runs After JWT Filter
@Slf4j
@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)){
            log.debug("Skipping tenant context for public endpoint:{}",requestPath);
            return true;
        }
        String jwt = parseJwt(request);
        if (jwt!=null && jwtUtil.validateToken(jwt)){
            String tenantId = jwtUtil.getTenantIdFromToken(jwt);
            Long userId = jwtUtil.getUserIdFromToken(jwt);
            String userRole = jwtUtil.getRoleFromToken(jwt);
            SubscriptionPlan subscriptionPlan = jwtUtil.getSubscriptionPlanFromToken(jwt);


            TenantContext context = new TenantContext(tenantId, userId, userRole,subscriptionPlan);
            TenantContextHolder.setContext(context);

            log.debug("Tenant context set for request:{} - userId:{}, tenantId:{}",requestPath,userId,tenantId);
        }else {
            //maybe user is authenticated from session
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication!=null && authentication.isAuthenticated()){
                log.debug("Authenticated user without jwt token --setting empty tenant context");
                TenantContextHolder.setContext(new TenantContext());
            }
        }

        return true ;
    }


    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                 @Nullable Exception ex) throws Exception {

        // CRITICAL: Clear ThreadLocal to prevent memory leaks
        TenantContextHolder.clear();
    log.debug("Tenant context cleared for request :{}",request.getRequestURI());
    }



    private boolean isPublicEndpoint(String path){
        return path.startsWith("/api/auth/")||
                path.startsWith("/actuator/")||
                path.equals("/api/super-admin/tenant"); //Tenant creation
    }

    private  String parseJwt(HttpServletRequest request ){
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")){
            return header.substring(7);
        }
        return null;
    }
}


