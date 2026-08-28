package com.inventorysaas.inventory_saas.Exception;

public class TenantIsolationException extends RuntimeException{

    public TenantIsolationException(String message){
        super(message);
    }
}
