package com.inventorysaas.inventory_saas.Enum;

public enum TransactionReason {
    PURCHASE,             //buys from supplier
    RETURN,               //Customer returns

    //Stock out reason
    SELL,                //sold to customer
    DAMAGE,              //damaged goods
    TRANSFER;            //transferring from one location to another

}
