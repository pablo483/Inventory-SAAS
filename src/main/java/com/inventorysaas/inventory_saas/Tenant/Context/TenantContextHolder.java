package com.inventorysaas.inventory_saas.Tenant.Context;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantContextHolder {


    private TenantContextHolder() {
        /* This utility class should not be instantiated */
    }


    private static final ThreadLocal<TenantContext> contextHolder = new ThreadLocal<>();

    //set tenant context for current thread
    public static void setContext(TenantContext context) {
        if (context != null) {
            log.debug("Setting tenant for :tenantId :{} userId :{}", context.getTenantId(), context.getUserId());
        }
        contextHolder.set(context);
    }

    //get context for current thread
    public static TenantContext getContext() {
        TenantContext context = contextHolder.get();
        if (context == null) {
            log.warn("TenantContext is empty ,this should not happen for authenticated request");
            return new TenantContext();
        }
        return context;
    }

    //get current tenantId
    public static String getCurrentTenantId() {
        TenantContext context = getContext();
        return context != null ? context.getTenantId() : null;
    }

    //get current userId
    public static Long getUserId() {
        TenantContext context = getContext();
        return context != null ? context.getUserId() : null;
    }

    //get current subscriptionsPlan
    public static SubscriptionPlan getSubscriptionPlan(){
        TenantContext context = getContext();
        return context!=null ? context.getSubscriptionPlan() : null;
    }

    //check if current user is Super Admin
    public static Boolean isSuperAdmin() {
        TenantContext context = getContext();
        return context != null && context.isSuperAdmin();
    }

    //clear current tenant context (Must be called after each request processing)
    public static void clear() {
        TenantContext context = getContext();
        if (context != null) {
            log.debug("Clearing Tenant Context , tenanId:{}", context.getTenantId());
        }
        contextHolder.remove();
    }

}
