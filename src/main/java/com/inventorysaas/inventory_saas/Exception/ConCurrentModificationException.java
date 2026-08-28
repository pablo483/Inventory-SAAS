package com.inventorysaas.inventory_saas.Exception;

public class ConCurrentModificationException  extends RuntimeException{
    public ConCurrentModificationException(String message){
        super(message);
    }
}
