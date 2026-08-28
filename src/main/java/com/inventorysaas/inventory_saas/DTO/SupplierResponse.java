package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {
    private Long id;
    private String name;
    private String tenantId;
    private String phone;
    private String contactEmail;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
