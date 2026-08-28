package com.inventorysaas.inventory_saas.Exception;

public class TenantNotFoundException extends RuntimeException{
    public TenantNotFoundException (String message){
         super(message);
    }
}
