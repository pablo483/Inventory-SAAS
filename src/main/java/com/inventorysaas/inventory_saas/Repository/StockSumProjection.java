package com.inventorysaas.inventory_saas.Repository;

public interface StockSumProjection {
    Long getProductId();
    int getTotalIn();
    int getTotalOut();
}
