package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.DTO.ProductRequest;
import com.inventorysaas.inventory_saas.DTO.ProductResponse;
import com.inventorysaas.inventory_saas.Entity.Category;
import com.inventorysaas.inventory_saas.Entity.Product;
import com.inventorysaas.inventory_saas.Entity.Supplier;
import com.inventorysaas.inventory_saas.Exception.ResourceNotFoundException;
import com.inventorysaas.inventory_saas.Exception.UserAlreadyExistException;
import com.inventorysaas.inventory_saas.Mapper.ProductMapper;
import com.inventorysaas.inventory_saas.Redis.Event.EventType;
import com.inventorysaas.inventory_saas.Redis.Event.InventoryEvent;
import com.inventorysaas.inventory_saas.Redis.Publisher.InventoryEventPublisher;
import com.inventorysaas.inventory_saas.Redis.Service.CategoryCacheService;
import com.inventorysaas.inventory_saas.Redis.Service.LeaderBoardService;
import com.inventorysaas.inventory_saas.Redis.Service.ProductCacheService;
import com.inventorysaas.inventory_saas.Redis.Service.SupplierCacheService;
import com.inventorysaas.inventory_saas.Repository.CategoryRepository;
import com.inventorysaas.inventory_saas.Repository.ProductRepository;
import com.inventorysaas.inventory_saas.Repository.SupplierRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private InventoryEventPublisher inventoryEventPublisher;

    @Autowired
    private LeaderBoardService leaderBoardService;

    @Autowired
    private ProductCacheService productCacheService;

    @Autowired
    private CategoryCacheService categoryCacheService;

    @Autowired
    private SupplierCacheService supplierCacheService;

    //Add product
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        // Check if SKU already exists for this tenant
        if (productRepository.existsByTenantIdAndSku(tenantId, request.getSku())) {
            throw new UserAlreadyExistException("Product with " + request.getName() + " already exists");
        }
        // Validate category exists and belongs to tenant
        Category category = categoryCacheService.getCategoryCache(tenantId, request.getCategoryId());

        if (!category.getTenantId().equals(tenantId)) {
            throw new UserAlreadyExistException("Category not found with id :" + request.getCategoryId());
        }

        //validate supplier exists and belong to tenant
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierCacheService.getSupplierCache(tenantId, request.getSupplierId());

            if (!supplier.getTenantId().equals(tenantId)) {
                throw new UserAlreadyExistException("Supplier not found with id :" + request.getSupplierId());
            }
        }
        Product product = productMapper.toEntity(request, tenantId);
        product.setCategory(category);
        product.setSupplier(supplier);

        //update cache and db of product
        Product saved = productCacheService.updateProductCache(tenantId, product);

        //publish PRODUCT_CREATED event
        InventoryEvent event = InventoryEvent.builder()
                .eventType(EventType.PRODUCT_CREATED)
                .tenantId(tenantId)
                .productId(saved.getId())
                .productSku(saved.getSku())
                .productName(saved.getName())
                .currentStock(saved.getCurrentStock())
                .minStockThreshold(saved.getMinStockThreshold())
                .performedBy(TenantContextHolder.getUserId().toString())
                .build();
        inventoryEventPublisher.publishEvent(event);

        //Increment inventory value leaderBoard (PRODUCT_CREATED)

        BigDecimal productValue = saved.getPrice().multiply(BigDecimal.valueOf(saved.getCurrentStock()));
        leaderBoardService.incrementInventoryValueScore(tenantId, productValue);


        log.info("Product created :{} ,(SKU:{}) for tenant:{}", saved.getName(), saved.getSku(), tenantId);

        return productMapper.toResponse(saved);

    }

    //Get all product with pageable
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        Page<Product> productPage = productRepository.findByTenantId(tenantId, pageable);
        List<ProductResponse> products = productPage.getContent().stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(products)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .isFirst(productPage.isFirst())
                .isLast(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    //Get product By id
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Product product = productCacheService.getProductCache(tenantId, id);
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id :" + id);
        }
        return productMapper.toResponse(product);
    }

    //Get products by CategoryId
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProductsByCategoryId(Long categoryId, Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Product product = productCacheService.getProductCache(tenantId,categoryId);
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id:" + categoryId);
        }
        Page<Product> productPage = productRepository.findByTenantIdAndCategoryId(tenantId, categoryId, pageable);
        List<ProductResponse> products = productPage.getContent().stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(products)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .isFirst(productPage.isFirst())
                .isLast(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }


    //Get Low Stock Products
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getLowStockProducts(Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Page<Product> productPage = productRepository.findLowStockProducts(tenantId, pageable);
        List<ProductResponse> lowStockProducts = productPage.getContent().stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(lowStockProducts)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .isFirst(productPage.isFirst())
                .isLast(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    //Get Products below threshold
    @Transactional(readOnly = true) // Keeps the session open for the stream/mapper
    public List<ProductResponse> getProductsBelowThreshold(Integer value) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        List<Product> products = productRepository.findProductsBelowThreshold(tenantId, value);
        // The session stays alive here so the mapper can load Category/Supplier
        return products.stream()
                .map(productMapper::toResponse)
                .toList();
    }

    //Update Products
    @Transactional
    public ProductResponse updateProductsById(Long id, ProductRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        // Fetch product directly from DB to avoid stale cache optimistic lock exceptions
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id :" + id));


        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id :" + id);
        }
        // Check SKU uniqueness if changed
        if (!product.getSku().equals(request.getSku()) && productRepository.existsByTenantIdAndSku(tenantId, request.getSku())) {//if new sku is changed then it'll check whether that new sku is already exist in another product
            throw new UserAlreadyExistException("Product with SKU :{}" + request.getSku() + "already exist");
        }

        //validate category
        Category category = categoryCacheService.getCategoryCache(tenantId, request.getCategoryId());
        if (!category.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Category not found with id:" + request.getCategoryId());
        }

        //validate supplier
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierCacheService.getSupplierCache(tenantId, request.getSupplierId());
        }
        if (!supplier.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Supplier not found with id:" + request.getSupplierId());
        }
        //Calculate OLD inventory value before update
        BigDecimal oldInventoryValue = product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));


        productMapper.updateEntity(product, request);
        product.setSupplier(supplier);
        product.setCategory(category);

        //update product cache and save product
        Product save = productCacheService.updateProductCache(tenantId, product);

        //Calculate new inventory value (updated)
        BigDecimal updatedInventoryValue = save.getPrice().multiply(BigDecimal.valueOf(save.getCurrentStock()));

        //Update leaderboard with difference
        BigDecimal difference = updatedInventoryValue.subtract(oldInventoryValue);
        leaderBoardService.incrementInventoryValueScore(tenantId, difference);

        //publish Product Updated event to redis(PRODUCT_UPDATED)
        InventoryEvent event = InventoryEvent.builder()
                .eventType(EventType.PRODUCT_UPDATED)
                .tenantId(tenantId)
                .productId(save.getId())
                .productName(save.getName())
                .productSku(save.getSku())
                .currentStock(save.getCurrentStock())
                .minStockThreshold(save.getMinStockThreshold())
                .performedBy(TenantContextHolder.getUserId().toString())
                .build();
        inventoryEventPublisher.publishEvent(event);

        log.info("Product Updated :{} with tenant :{}", save.getId(), save.getTenantId());

        return productMapper.toResponse(save);
    }


    //Delete Product
    @Transactional
    public void deleteProductById(Long id) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        // Get product directly from DB
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id :" + id));
        product.getCategory().getName();
        if (!product.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Product not found with id :" + id);
        }
        productRepository.delete(product);
        //delete product from caching too
        productCacheService.evictCacheProduct(tenantId, id);

        //  Calculate inventory value to REMOVE from leaderboard
        BigDecimal totalInventoryValue = product.getPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()));

        //Decrease leaderboard(negative value)
        leaderBoardService.incrementInventoryValueScore(tenantId, totalInventoryValue.negate());

        //Publish PRODUCT DELETED event
        InventoryEvent event = InventoryEvent.builder()
                .eventType(EventType.PRODUCT_DELETED)
                .tenantId(tenantId)
                .productId(product.getId())
                .productSku(product.getSku())
                .productName(product.getName())
                .currentStock(product.getCurrentStock())
                .minStockThreshold(product.getMinStockThreshold())
                .performedBy(TenantContextHolder.getUserId().toString())
                .build();
        inventoryEventPublisher.publishEvent(event);

        log.info("Product deleted successfully for id:" + id);
    }

//    @Transactional(readOnly = true)
//    public List<ProductResponse> getAllProducts() {
//        List<Product> products = productRepository.findAll();
//        return products.stream()
//                .map(productMapper::toResponse)
//                .collect(Collectors.toList());
//    }


}
