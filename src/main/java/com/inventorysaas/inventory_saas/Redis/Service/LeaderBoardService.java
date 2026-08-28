package com.inventorysaas.inventory_saas.Redis.Service;

import com.inventorysaas.inventory_saas.DTO.LeaderBoardEntry;
import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

//handle leaderboard operations
@Service
@Slf4j
public class LeaderBoardService {


    private static final String SALES_LEADERBOARD_KEY = "leaderboard:tenant:sales";
    private static final String INVENTORY_LEADERBOARD_KEY = "leaderboard:tenant:inventory";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantCacheService tenantCacheService;


    //get top tenants by sales
    public List<LeaderBoardEntry> getTopTenantsBySales(Integer limit) {

        return getTopTenants(SALES_LEADERBOARD_KEY, limit, "sales");

    }

    //get top N tenants By Inventory value
    public List<LeaderBoardEntry> getTopTenantsByInventoryValue(Integer limit) {
        return getTopTenants(INVENTORY_LEADERBOARD_KEY, limit, "inventory_value");
    }


    //Generic method to get Top N tenants by sales

    private List<LeaderBoardEntry> getTopTenants(String key, Integer limit, String metric) {

        List<LeaderBoardEntry> entries = new ArrayList<>();

        try {
            //get top N by descending order
            Set<ZSetOperations.TypedTuple<Object>> results = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, limit - 1);

            int rank = 1;
            for (ZSetOperations.TypedTuple<Object> result : results) {

                String tenantId = (String) result.getValue();
                Double score = result.getScore();

                if (tenantId == null || score == null) {
                    return entries;
                }

                //get tenant details
                Tenant tenant = tenantCacheService.getTenantCache(tenantId);
                String companyName = tenant != null ? tenant.getCompanyName() : "Unknown";

                LeaderBoardEntry entry = LeaderBoardEntry.builder()
                        .rank(rank++)
                        .tenantId(tenantId)
                        .companyName(companyName)
                        .score(BigDecimal.valueOf(score))
                        .metrics(metric)
                        .build();
                entries.add(entry);

            }
        } catch (Exception e) {
            log.error("Error retrieving leaderboard", e.getMessage(), e);
        }
        return entries;
    }

    //get tenant rank by sales(1-indexed)
    public Long getTenantSalesRank(String tenantId) {
        Long rank = redisTemplate.opsForZSet().reverseRank(SALES_LEADERBOARD_KEY, tenantId);
        return rank != null ? rank + 1 : null;

    }

    //get tenant score by sales
    public BigDecimal getTenantSalesScore(String tenantId) {
        Double score = redisTemplate.opsForZSet().score(SALES_LEADERBOARD_KEY, tenantId);
        return score != null ? BigDecimal.valueOf(score) : null;
    }

    //get tenant rank by inventory value
    public Long getTenantInventoryValueRank(String tenantId) {
        Long rank = redisTemplate.opsForZSet().reverseRank(INVENTORY_LEADERBOARD_KEY, tenantId);
        return rank != null ? rank + 1 : null;
    }

    //get tenant score by inventory value
    public BigDecimal getTenantInventoryScore(String tenantId) {
        Double score = redisTemplate.opsForZSet().score(INVENTORY_LEADERBOARD_KEY, tenantId);
        return score != null ? BigDecimal.valueOf(score) : null;
    }


    //increment sales score(atomic)
    public void incrementSalesScore(String tenantId, BigDecimal amount) {
        try {
            redisTemplate.opsForZSet().incrementScore(SALES_LEADERBOARD_KEY, tenantId, amount.doubleValue());
            log.info("Incremented sales score for tenant :{} by {}", tenantId, amount);
        } catch (Exception e) {
            log.error("Error incrementing sales score :{}", e.getMessage(), e);
        }
    }

    //increment inventory value  score(atomic)
    public void incrementInventoryValueScore(String tenantId, BigDecimal amount) {
        try {
            redisTemplate.opsForZSet().incrementScore(INVENTORY_LEADERBOARD_KEY, tenantId, amount.doubleValue());
            log.info("Incremented inventory value score for tenant :{} by {}", tenantId, amount);
        } catch (Exception e) {
            log.error("Error incrementing inventory score :{}", e.getMessage(), e);
        }
    }

    //update sales score
    public void updateSalesScore(String tenantId, BigDecimal amount) {
        try {
            redisTemplate.opsForZSet().add(SALES_LEADERBOARD_KEY, tenantId, amount.doubleValue());
            log.info("Updated sales score for tenant :{} by {} ", tenantId, amount);
        } catch (Exception e) {
            log.error("Error updating sales score :{}", e.getMessage(), e);
        }
    }

    //update inventory value score
    public void updateInventoryValueScore(String tenantId, BigDecimal amount) {
        try {
            redisTemplate.opsForZSet().add(INVENTORY_LEADERBOARD_KEY, tenantId, amount.doubleValue());
            log.info("Updated inventory score for tenant :{} by {} ", tenantId, amount);
        } catch (Exception e) {
            log.error("Error updating inventory score :{}", e.getMessage(), e);
        }
    }

    /**
     * Get sales rank for multiple tenants in on redis call
     */

    public Map<String, Long> getTenantSalesRanks(List<String> tenantIds) {
        Map<String, Long> ranks = new HashMap<>();
        for (String tenantId : tenantIds) {
            Long rank = redisTemplate.opsForZSet().reverseRank(SALES_LEADERBOARD_KEY, tenantId);
            ranks.put(tenantId, rank != null ? rank + 1 : 0);//Convert to 1-indexed
        }
        return ranks;
    }

    /**
     * Get Inventory value ranks for multiple tenants in redis call
     */
    public Map<String,Long> getTenantInventoryValueRanks(List<String> tenantIds){
        Map<String,Long> ranks=new HashMap<>();
        for (String tenantId:tenantIds){
            Long rank = redisTemplate.opsForZSet().reverseRank(INVENTORY_LEADERBOARD_KEY, tenantId);
            ranks.put(tenantId,rank!=null?rank+1:0); //Convert to 1-indexed
        }
        return ranks;
    }
}
