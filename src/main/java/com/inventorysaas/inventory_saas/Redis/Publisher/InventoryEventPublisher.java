package com.inventorysaas.inventory_saas.Redis.Publisher;

import com.inventorysaas.inventory_saas.Redis.Event.EventType;
import com.inventorysaas.inventory_saas.Redis.Event.InventoryEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Publisher for inventory events to Redis Pub/Sub
 */
@Service
@Slf4j
public class InventoryEventPublisher {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    //publish inventoryEvent to tenant-specific channel
    public void publishEvent(InventoryEvent event) {

        try {
            //set eventId and timestamp if not set
            if (event.getEventId() == null) {
                event.setEventId(UUID.randomUUID().toString());
            }

            if (event.getTimestamp() == null) {
                event.setTimestamp(LocalDateTime.now());
            }
            String channel = event.getChannelName();
            redisTemplate.convertAndSend(channel, event);

            log.info("Published event :{} to channel :{} :{} -product :{}", event.getEventId(), channel, event.getEventType(), event.getProductSku());
        } catch (Exception e) {
            log.error("Failed to publish inventory event :{}", e.getMessage(), e);
            //don't throe -pub/sub failure should not break transaction
        }
    }


    //publish stock change event
    public void publishStockChange(
            EventType eventType,
            String tenantId,
            Long productId,
            String productSku,
            String productName,
            Integer quantity,
            Integer currentStock,
            Integer minStockThreshold,
            String performedBy
    ) {
        InventoryEvent event = InventoryEvent.builder()
                .eventType(eventType)
                .tenantId(tenantId)
                .productId(productId)
                .productSku(productSku)
                .productName(productName)
                .quantity(quantity)
                .currentStock(currentStock)
                .minStockThreshold(minStockThreshold)
                .performedBy(performedBy)
                .message(buildMessage(eventType, productSku, quantity, currentStock))
                .build();

        publishEvent(event);

        //Check product low stock and publish alter in redis
        if (currentStock <= minStockThreshold) {
            publishLowStockAlert(tenantId, productId, productSku, productName, quantity, currentStock, minStockThreshold, performedBy);
        }
    }

    public void publishLowStockAlert(
            String tenantId,
            Long productId,
            String productSku,
            String productName,
            Integer quantity,
            Integer currentStock,
            Integer minStockThreshold,
            String performedBy
    ) {
        InventoryEvent event = InventoryEvent.builder()
                .eventType(EventType.LOW_STOCK_ALERT)
                .tenantId(tenantId)
                .productId(productId)
                .productName(productName)
                .quantity(quantity)
                .currentStock(currentStock)
                .minStockThreshold(minStockThreshold)
                .performedBy(performedBy)
                .productSku(productSku)
                .message(String.format("LOW STOCK ALERT :%s (%s) Current :%d Threshold:%d", productName, productSku, currentStock, minStockThreshold))
                .build();
        publishEvent(event);
    }

    //Build Human readable message
    private String buildMessage(EventType eventType, String productSku, Integer quantity, Integer currentStock) {

        return switch (eventType) {
            case STOCK_IN ->
                    String.format("Stock increased for %s : +%d (Current :%d)", productSku, quantity, currentStock);
            case STOCK_OUT ->
                    String.format("Stock decreased for %s : +%d (Current :%d", productSku, quantity, currentStock);
            case PRODUCT_CREATED -> String.format("New product created : %s", productSku);
            case PRODUCT_DELETED -> String.format("Product deleted :%s", productSku);
            case PRODUCT_UPDATED -> String.format("Product updated :%s", productSku);
            default -> String.format("Event for product: %s", productSku);

        };
    }

}
