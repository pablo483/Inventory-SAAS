package com.inventorysaas.inventory_saas.Redis.Listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventorysaas.inventory_saas.Redis.Event.InventoryEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
/**
 * Listener for inventory events from Redis Pub/Sub
 * In production, this would broadcast to WebSocket connections
 */
@Component
@Slf4j
public class InventoryEventListener {


    @Autowired
    private ObjectMapper  objectMapper;

    //handle incoming inventory event
    //called by messageListenerAdaptor
    public void onMessage(String message,String channel){
     try {
         InventoryEvent event = objectMapper.readValue(message, InventoryEvent.class);

         log.error("Received Inventory event channel {} :{} {}",channel,event.getEventType(),event.getMessage());

         //process event based on type
         switch (event.getEventType()){
             case STOCK_IN,STOCK_OUT -> handleStockChangeEvent(event);
             case LOW_STOCK_ALERT -> handleLowStockAlert(event);
             case PRODUCT_CREATED,PRODUCT_DELETED,PRODUCT_UPDATED -> handleProductChangeEvent(event);
         }

         // In production: Broadcast to WebSocket clients in this tenant
         // broadcastToWebSocketClients(event);

     }catch (Exception e){
         log.error("Error processing inventory event ",e.getMessage(),e);
     }
    }


    //Handle stock change event
    public void handleStockChangeEvent(InventoryEvent event){
        log.info("Stock change for tenant {}:{} -Current Stock :{}",event.getTenantId(),event.getProductSku(),event.getCurrentStock());
        //could trigger notifications ,webhooks, etc.
    }

    //Handle Low stock alert
    public void handleLowStockAlert(InventoryEvent event){
        log.info("LOW STOCK ALERT for tenant {}:{} -stock {}/{}",event.getTenantId(),event.getProductSku(),event.getCurrentStock(),event.getMinStockThreshold());
        //could send SMS/Email Notification
    }

    //Handle Product Changes events
    public void handleProductChangeEvent(InventoryEvent event){
        log.info("Product change for tenant {} : {} -{}",event.getTenantId(),event.getProductSku(),event.getEventType());

    }

}
