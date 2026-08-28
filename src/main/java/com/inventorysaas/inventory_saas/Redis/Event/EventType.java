package com.inventorysaas.inventory_saas.Redis.Event;
/**
 * Types of inventory events
 */
public enum EventType {
    STOCK_IN,
    STOCK_OUT,
    PRODUCT_CREATED,
    PRODUCT_DELETED,
    PRODUCT_UPDATED,
    LOW_STOCK_ALERT
}
