package com.inventorysaas.inventory_saas.Exception;

public class InvalidTenantAccessException extends RuntimeException{
    public InvalidTenantAccessException(String message){
        super(message);
    }
}
