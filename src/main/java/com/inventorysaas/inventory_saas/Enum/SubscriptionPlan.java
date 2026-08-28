package com.inventorysaas.inventory_saas.Enum;

public enum SubscriptionPlan {
    BASIC(100, 1000, 3600),                    //100 users , 1000 products ,1 hour cache time
    INTERMEDIATE(1000, 10000, 7200),
    ENTERPRISE(9999, 999999, 14440);          //Unlimited users and products ,4 hrs cache time

    private final int maxUsers;
    private final int maxProducts;
    private final int cacheTtlSeconds;

    SubscriptionPlan(int maxUsers, int maxProducts, int cacheTtlSeconds) {
        this.maxUsers = maxUsers;
        this.maxProducts = maxProducts;
        this.cacheTtlSeconds = cacheTtlSeconds;
    }

    public int getMaxUsers() {
        return maxUsers;
    }

    public int getMaxProducts() {
        return maxProducts;
    }

    public int getCacheTtlSeconds() {
        return cacheTtlSeconds;
    }

}
