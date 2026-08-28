package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.LeaderBoardEntry;
import com.inventorysaas.inventory_saas.Redis.Service.LeaderBoardService;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

//Controller for leaderboard operations
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderBoardController {


    @Autowired
    private LeaderBoardService leaderBoardService;

    //Get top tenants by sales(Top N)
    //GET /api/leaderboard/sales?limit=10

    @GetMapping("/sales")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<LeaderBoardEntry>> getTopTenantsBySales(@RequestParam(defaultValue = "10") Integer limit) {

        List<LeaderBoardEntry> response = leaderBoardService.getTopTenantsBySales(limit);
        return ResponseEntity.ok(response);
    }

    //Get top N tenants by inventory value
    //GET /api/leaderboard/inventory-value
    @GetMapping("/inventory-value")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<LeaderBoardEntry>> getTopTenantsByInventoryValue(@RequestParam(defaultValue = "10") Integer limit) {
        List<LeaderBoardEntry> response = leaderBoardService.getTopTenantsByInventoryValue(limit);
        return ResponseEntity.ok(response);
    }

    //Get current Tenants score and rank (both inventory and sales)
    //GET /api/leaderboard/my-rank
    @GetMapping("/my-rank")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyRank() {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        Long salesRank = leaderBoardService.getTenantSalesRank(tenantId);
        Long inventoryValueRank = leaderBoardService.getTenantInventoryValueRank(tenantId);
        BigDecimal salesScore = leaderBoardService.getTenantSalesScore(tenantId);
        BigDecimal inventoryScore = leaderBoardService.getTenantInventoryScore(tenantId);

        Map<String, Object> results = new HashMap<>();
        results.put("tenantId", tenantId);
        results.put("salesRank", salesRank);
        results.put("inventoryRank", inventoryValueRank);
        results.put("salesScore", salesScore);
        results.put("inventoryScore", inventoryScore);
        return ResponseEntity.ok(results);

    }
}
