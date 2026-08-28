package com.inventorysaas.inventory_saas.DTO;

import com.inventorysaas.inventory_saas.Enum.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String username;
    private String email;
    private String phone;
    private Role role;
    private Boolean isActive;
}
