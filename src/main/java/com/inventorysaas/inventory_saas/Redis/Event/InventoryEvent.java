package com.inventorysaas.inventory_saas.Redis.Event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Inventory event for Redis Pub/Sub
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryEvent implements Serializable {

    private static final Long serialVersionUID = 1L;

    private String eventId;
    private EventType eventType;
    private String tenantId;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private Integer currentStock;
    private Integer minStockThreshold;
    private LocalDateTime timestamp;
    private String performedBy;
    private String message;

    /**
     * Build channel name for this event
     */
    public String getChannelName() {
        return String.format("tenant:%s:inventory", tenantId);
    }

}
