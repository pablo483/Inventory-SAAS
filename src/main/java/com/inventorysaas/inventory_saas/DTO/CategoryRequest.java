package com.inventorysaas.inventory_saas.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @Size(min = 5 ,max = 100 , message = "Description must be between 5 to 100 character long")
    private String description;
}
