package com.inventorysaas.inventory_saas.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    @NotBlank(message = "Supplier name cannot be empty")
    @Size(min = 2 ,max = 100 , message = "Supplier name must be between 2 to 100 characters ")
    private String name;

    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Invalid phone number format")
    @Size(max = 20,message = "Phone no must be less that 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 100 ,message = "Email cannot exceed 100 characters")
    private String contactEmail;

    @Size(max = 500,message = "Address cannot exceed 500 characters")
    private String address;
}
