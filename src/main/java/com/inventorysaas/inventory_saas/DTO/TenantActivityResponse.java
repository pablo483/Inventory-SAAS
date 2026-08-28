package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Recent activity of tenant
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TenantActivityResponse {

    private String tenantId;
    private String companyName;
    private List<ActivityLog> recentActivity;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ActivityLog{
        private LocalDateTime timestamp;
        private String activityType;//USER_LOGIN,PRODUCT_CREATED,STOCK_TRANSACTION etc.
        private String description;
        private String performedBy;
    }
}
