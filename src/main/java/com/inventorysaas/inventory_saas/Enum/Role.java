package com.inventorysaas.inventory_saas.Enum;

//SUPER_ADMIN: can manage tenants
//TENANT_ADMIN: can manage tenants users
//TENANT_USER:regular staff
public enum Role {
    SUPER_ADMIN,
    TENANT_ADMIN,
    TENANT_USER,
}
