package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.DTO.SupplierRequest;
import com.inventorysaas.inventory_saas.DTO.SupplierResponse;
import com.inventorysaas.inventory_saas.Entity.Supplier;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Exception.UserAlreadyExistException;
import com.inventorysaas.inventory_saas.Mapper.SupplierMapper;
import com.inventorysaas.inventory_saas.Redis.Service.SupplierCacheService;
import com.inventorysaas.inventory_saas.Repository.SupplierRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SupplierMapper supplierMapper;

    @Autowired
    private SupplierCacheService supplierCacheService;

    //Create Supplier
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        if (supplierRepository.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new UserAlreadyExistException("Supplier with " + request.getName() + "already exists");
        }

        Supplier supplier = supplierMapper.toEntity(request, tenantId);
        //updating cache with new supplier and in db too
        Supplier saved = supplierCacheService.updateSupplierCache(tenantId,supplier);
        log.info("Supplier created :{} for tenant :{}", saved.getName(), tenantId);
        return supplierMapper.toResponse(saved);
    }

    //get All Supplier
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getAllSuppliers(Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Page<Supplier> supplierPage = supplierRepository.findByTenantId(tenantId, pageable);
        List<SupplierResponse> suppliers = supplierPage.getContent().stream()
                .map(supplierMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<SupplierResponse>builder()
                .content(suppliers)
                .pageNumber(supplierPage.getNumber())
                .pageSize(supplierPage.getSize())
                .totalPages(supplierPage.getTotalPages())
                .totalElements(supplierPage.getTotalElements())
                .isFirst(supplierPage.isFirst())
                .isLast(supplierPage.isLast())
                .hasNext(supplierPage.hasNext())
                .hasPrevious(supplierPage.hasPrevious())
                .build();

    }

    //Get Supplier By id
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        //getting supplier from cache
        Supplier supplier = supplierCacheService.getSupplierCache(tenantId,id);
        //Validate Tenant Ownership
        if (!supplier.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Supplier already exists with id :" + id);
        }
        return supplierMapper.toResponse(supplier);
    }

    //Update Supplier by id
    @Transactional
    public SupplierResponse updateSupplierById(Long id, SupplierRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        //getting supplier from cache
        Supplier supplier = supplierCacheService.getSupplierCache(tenantId,id);

        if (!supplier.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Supplier not found with id:" + id);
        }

        if (!supplier.getName().equals(request.getName()) && supplierRepository.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new UserAlreadyExistException("Supplier with name " + request.getName() + " already exist");
        }

        supplierMapper.updateEntity(supplier, request);
        //updating cache and db for supplier
        Supplier updated = supplierCacheService.updateSupplierCache(tenantId,supplier);
        return supplierMapper.toResponse(updated);
    }

    //Delete Supplier by id
    @Transactional
    public void deleteSupplierById(Long id) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        //getting supplier from cache
        Supplier supplier = supplierCacheService.getSupplierCache(tenantId,id);
        if (!supplier.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Supplier does not exist with id:" + id);
        }
        supplierRepository.delete(supplier);
        //deleting from cache too
        supplierCacheService.evictSupplierCache(tenantId,id);
        log.info("Supplier with id :{} deleted successfully for tenant:{}", id, tenantId);
    }
}
