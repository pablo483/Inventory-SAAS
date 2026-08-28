package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * System health check response
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SystemHealthResponse {

    private String status; //UP,DOWN,DEGRADED
    private LocalDateTime timestamp;
    private Map<String,ComponentHealth> components;


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ComponentHealth{
        private String status;//UP,DOWN
        private String description;
        private Long responseTimeMs;

    }
}
