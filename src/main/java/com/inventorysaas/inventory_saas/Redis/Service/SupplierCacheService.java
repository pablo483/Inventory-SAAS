package com.inventorysaas.inventory_saas.Redis.Service;

import com.inventorysaas.inventory_saas.Entity.Supplier;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Repository.SupplierRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class SupplierCacheService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Cacheable(value = "suppliers",key = "#tenantId + ':' + #supplierId")
    public Supplier getSupplierCache(String tenantId,Long supplierId){
        log.info("Missed caching for supplier:{}-fetching from db",supplierId);
        return supplierRepository.findById(supplierId).orElseThrow(()->new ResourceNotFoundException("Supplier not found with id"+supplierId));



    }

    @CachePut(value = "suppliers",key = "#tenantId + ':' + #supplier.id")
    public Supplier updateSupplierCache(String tenantId,Supplier supplier){
        log.info("Updated cache for supplier:{}",supplier.getId());
        return supplierRepository.save(supplier);
    }

    @CacheEvict(value = "suppliers",key = "#tenantId + ':' + #supplierId")
    public void evictSupplierCache(String tenantId,Long supplierId){
        log.info("Evicted cache for Supplier:{}",supplierId);
    }
}
