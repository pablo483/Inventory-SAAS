package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.*;
import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.Role;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Redis.Service.LeaderBoardService;
import com.inventorysaas.inventory_saas.Redis.Service.TenantCacheService;
import com.inventorysaas.inventory_saas.Repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for super admin operations
 */
@Service
@Slf4j
public class SuperAdminService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantMetricsRepository tenantMetricsRepository;

    @Autowired
    private LeaderBoardService leaderBoardService;

    @Autowired
    private TenantCacheService tenantCacheService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;


    /**
     * Get All tenants with pagination and filtering
     */
    public Page<TenantDetailResponse> getAllTenants(TenantSearchRequest request, Pageable pageable) {

        Page<Tenant> pageTenants = tenantRepository.findTenantsByFiltering(request.getSearchTerm(), request.getSubscriptionPlan(), request.getIsActive(), pageable);

        List<Tenant> tenants = pageTenants.getContent();
        if (tenants.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<String> tenantIds = tenants.stream()
                .map(Tenant::getTenantId)
                .collect(Collectors.toList());

        //bulk load all resource counts
        List<Map<String, Object>> resourceCount = tenantRepository.bulkCountResourcesByTenantIds(tenantIds);
        Map<String, Map<String, Object>> countMap = resourceCount.stream()
                .collect(Collectors.toMap(m -> m.get("tenantId").toString(),
                        m -> m));

        //bulk load all the metrics
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        List<Map<String, Object>> metrics = tenantMetricsRepository.bulkGetMetricsForTenants(tenantIds, today, thirtyDaysAgo);
        Map<String, Map<String, Object>> metricsMap = metrics.stream()
                .collect(Collectors.toMap(m -> m.get("tenantId").toString(),
                        m -> m));

        //Getting leaderboard rank in bulk
        Map<String, Long> tenantSalesRanks = leaderBoardService.getTenantSalesRanks(tenantIds);

        Map<String, Long> tenantInventoryValueRanks = leaderBoardService.getTenantInventoryValueRanks(tenantIds);

        //Build responses for only paginated tenants
        List<TenantDetailResponse> responses = tenants.stream()
                .map(tenant -> buildTenantDetailsResponseInBulk(tenant,
                        countMap.get(tenant.getTenantId()), metricsMap.get(tenant.getTenantId()),
                        tenantSalesRanks.get(tenant.getTenantId()), tenantInventoryValueRanks.get(tenant.getTenantId())))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, pageTenants.getTotalElements());

    }

    /**
     * Get Tenant Details By Id
     */
    @Transactional(readOnly = true)
    public TenantDetailResponse getTenantDetails(String tenantId) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        return buildTenantDetailsResponse(tenant);
    }

    /**
     * Update tenant
     */
    @Transactional
    public TenantDetailResponse updateTenant(String tenantId, UpdateTenantRequest request) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);

        tenant.setCompanyName(request.getCompanyName());
        tenant.setEmail(request.getEmail());

        if (request.getSubscriptionPlan() != null) {
            tenant.setSubscriptionPlan(request.getSubscriptionPlan());
        }

        if (request.getIsActive() != null) {
            tenant.setIsActive(request.getIsActive());
        }

        if (request.getConfigJson() != null) {
            tenant.setJsonConfig(request.getConfigJson());
        }

        Tenant updated = tenantRepository.save(tenant);
        tenantCacheService.evictTenantCache(tenantId);

        log.info("Super admin tenant Updated :{}", tenantId);
        return buildTenantDetailsResponse(updated);

    }

    /**
     * Change tenant subscription plan
     */
    @Transactional
    public TenantDetailResponse changeTenantPlan(String tenantId, ChangePlanRequest request) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        SubscriptionPlan oldPlan = tenant.getSubscriptionPlan();
        tenant.setSubscriptionPlan(request.getNewPlan());

        Tenant updated = tenantRepository.save(tenant);

        //Evict cache (new Plan has different TTL)
        tenantCacheService.evictTenantCache(tenantId);
        log.info("Subscription Plan Changed for tenant :{} from {} to {} :{}", tenantId, oldPlan, request.getNewPlan(), request.getReason());
        return buildTenantDetailsResponse(updated);
    }

    /**
     * Activate tenant
     */
    @Transactional
    public void activateTenant(String tenantId) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        tenant.setIsActive(true);
        tenantRepository.save(tenant);
        log.info("Super admin activated tenant :{}", tenantId);
    }

    /**
     * Deactivate tenant
     */
    @Transactional
    public void deactivateTenant(String tenantId) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        tenant.setIsActive(false);
        tenantRepository.save(tenant);
        log.info("Super admin deactivated tenant :{}", tenantId);
    }

    /**
     * Delete tenant (cascade delete)
     */
    @Transactional
    public void deleteTenant(String tenantId) {
        Tenant tenant = tenantCacheService.getTenantCache(tenantId);
        tenantRepository.delete(tenant);
        tenantCacheService.evictTenantCache(tenantId);
        log.info("Super admin deleted tenant :{} -all data removed ", tenantId);
    }

    /**
     * Get global System metrics
     */
    public GlobalMetricsResponse getGlobalMetrics() {

        List<Tenant> allTenants = tenantRepository.findAll();

        //Tenant Statistics
        int totalTenants = allTenants.size();
        int activeTenants = (int) allTenants.stream().filter(Tenant::getIsActive).count();
        int inActiveTenants = totalTenants - activeTenants;

        //Subscription Statistics
        //Map<SubscriptionPlan, Integer> tenantsByPlan = allTenants.stream().collect(Collectors.groupingBy(tenant -> tenant.getSubscriptionPlan().name(), Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        Map<String, Integer> tenantsByPlan = allTenants.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getSubscriptionPlan().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        //User Statistics
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalAdmins = allUsers.stream().filter(u -> u.getRole() == Role.TENANT_ADMIN || u.getRole() == Role.SUPER_ADMIN).count();
        long totalRegularUsers = totalAdmins - totalAdmins;

        //product Status
        long totalProducts = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalSuppliers = supplierRepository.count();

        //StockTransaction Statistics
        long totalStockTransactions = stockTransactionRepository.count();

        BigDecimal totalSalesValue = BigDecimal.ZERO;
        BigDecimal totalInventoryValue = BigDecimal.ZERO;

        for (Tenant tenant : allTenants) {
            BigDecimal tenantInventoryValue = productRepository.calculateTotalInventoryValue(tenant.getTenantId());
            if (tenantInventoryValue != null) {
                totalInventoryValue = totalInventoryValue.add(tenantInventoryValue);
            }
            
            BigDecimal tenantSalesValue = stockTransactionRepository.calculateTotalSalesValue(tenant.getTenantId());
            if (tenantSalesValue != null) {
                totalSalesValue = totalSalesValue.add(tenantSalesValue);
            }
        }

        //Api Statistics

        //Growth Statistics
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long newTenantsThisMonth = allTenants.stream().filter(tenant -> tenant.getCreatedAt().isAfter(thirtyDaysAgo.atStartOfDay())).count();
        long newUsersThisMonth = allUsers.stream().filter(user -> user.getCreatedAt().isAfter(thirtyDaysAgo.atStartOfDay())).count();

        //Building Global Metrics Response
        return GlobalMetricsResponse.builder()
                .totalTenants(totalTenants)
                .totalActiveTenants(activeTenants)
                .inactiveTenants(inActiveTenants)
                .tenantsByPlan(tenantsByPlan)
                .totalAdmins(totalAdmins)
                .totalUsers(totalUsers)
                .totalRegularUsers(totalRegularUsers)
                .totalProducts(totalProducts)
                .totalSuppliers(totalSuppliers)
                .totalCategories(totalCategories)
                .totalApiCalls(0L) // Would aggregate from metrics
                .totalStorageUsed(0L) // Would aggregate from metrics
                .totalSystemSales(totalSalesValue)
                .totalSystemInventoryValue(totalInventoryValue)
                .newTenantsThisMonth(newTenantsThisMonth)
                .newUsersThisMonths(newUsersThisMonth)
                .totalStockTransactions(totalStockTransactions)
                .build();
    }


    /**
     * Get All User Across All tenants
     */
    @Transactional
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Update user
     */
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        User updated = userRepository.save(user);
        
        return UserResponse.builder()
                .id(updated.getId())
                .username(updated.getUsername())
                .email(updated.getEmail())
                .phone(updated.getPhone())
                .role(updated.getRole())
                .tenantId(updated.getTenantId())
                .isActive(updated.getIsActive())
                .createdAt(updated.getCreatedAt())
                .build();
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        log.info("Super admin deleted user: {}", userId);
    }

    /**
     * Build tenant Response Using pre-fetch Data
     */
    private TenantDetailResponse buildTenantDetailsResponseInBulk(Tenant tenant, Map<String, Object> resourceCount,
                                                                  Map<String, Object> metricMap, Long tenantSalesRank, Long tenantInventoryValueRank) {
        //Extract Count from map
        int totalUsers = resourceCount != null ? ((Number) resourceCount.get("UserCount")).intValue() : 0;
        int totalProducts = resourceCount != null ? ((Number) resourceCount.get("ProductCount")).intValue() : 0;
        int totalCategories = resourceCount != null ? ((Number) resourceCount.get("CategoryId")).intValue() : 0;
        int totalSuppliers = resourceCount != null ? ((Number) resourceCount.get("SupplierId")).intValue() : 0;

        //Extract Metrics From Map
        BigDecimal totalSales = metricMap != null && metricMap.get("totalSales") != null ? new BigDecimal(metricMap.get("totalSales").toString()) : BigDecimal.ZERO;
        BigDecimal totalInventoryValue = metricMap != null && metricMap.get("totalInventoryValue") != null ? new BigDecimal(metricMap.get("totalInventoryValue").toString()) : BigDecimal.ZERO;
        long totalApiCalls = metricMap != null && metricMap.get("apiCalls") != null ? ((Number) metricMap.get("apiCalls")).longValue() : 0L;
        long totalStorgeUsed = metricMap != null && metricMap.get("storageUsed") != null ? ((Number) metricMap.get("storageUsed")).longValue() : 0L;


        //Now Making a tenant Details Response
        return TenantDetailResponse.builder()
                .tenantId(tenant.getTenantId())
                .id(tenant.getId())
                .email(tenant.getEmail())
                .companyName(tenant.getCompanyName())
                .subscriptionPlan(tenant.getSubscriptionPlan())
                .isActive(tenant.getIsActive())
                .inventoryValueRank(tenantInventoryValueRank)
                .inventoryValue(totalInventoryValue)
                .totalStorageUsed(totalStorgeUsed)
                .configJson(tenant.getJsonConfig())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .salesRank(tenantSalesRank)
                .totalCategories(totalCategories)
                .totalProducts(totalProducts)
                .totalApiCalls(totalApiCalls)
                .totalSalesVales(totalSales)
                .totalSuppliers(totalSuppliers)
                .totalUsers(totalUsers)
                .build();

    }

    /**
     * For Single user
     */
    public TenantDetailResponse buildTenantDetailsResponse(Tenant tenant) {
        String tenantId = tenant.getTenantId();

        //Count resources
        int totalUsers = (userRepository.countByTenantId(tenantId)).intValue();
        int totalCategories = (categoryRepository.countByTenantId(tenantId)).intValue();
        int totalProducts = ((Number) productRepository.countByTenantId(tenantId)).intValue();
        int totalSupplier = (supplierRepository.countByTenantId(tenantId)).intValue();


        //Get Latest Metrics
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        com.inventorysaas.inventory_saas.Repository.TenantMetricsRepository.TenantAggregatedMetricsProjection metrics = tenantMetricsRepository.getAggregatedMetrics(tenantId, thirtyDaysAgo, today);

        BigDecimal totalSales = metrics != null && metrics.getTotalSells() != null ? metrics.getTotalSells() : BigDecimal.ZERO;
        BigDecimal totalInventoryValue = metrics != null && metrics.getTotalInventoryValue() != null ? metrics.getTotalInventoryValue() : BigDecimal.ZERO;
        long totalApiCalls = metrics != null && metrics.getApiCalls() != null ? metrics.getApiCalls() : 0L;
        long totalStorageUsed = metrics != null && metrics.getStorageUsed() != null ? metrics.getStorageUsed() : 0L;

        //Get Leaderboards Ranking
        Long salesRank = leaderBoardService.getTenantSalesRank(tenantId);
        Long inventoryValueRank = leaderBoardService.getTenantInventoryValueRank(tenantId);

        return TenantDetailResponse.builder()
                .id(tenant.getId())
                .companyName(tenant.getCompanyName())
                .email(tenant.getEmail())
                .tenantId(tenantId)
                .subscriptionPlan(tenant.getSubscriptionPlan())
                .isActive(tenant.getIsActive())
                .configJson(tenant.getJsonConfig())
                .totalUsers(totalUsers)
                .totalCategories(totalCategories)
                .totalProducts(totalProducts)
                .totalSuppliers(totalSupplier)
                .totalSalesVales(totalSales)
                .totalApiCalls(totalApiCalls)
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .inventoryValue(totalInventoryValue)
                .totalStorageUsed(totalStorageUsed)
                .salesRank(salesRank)
                .inventoryValueRank(inventoryValueRank)
                .build();

    }

}