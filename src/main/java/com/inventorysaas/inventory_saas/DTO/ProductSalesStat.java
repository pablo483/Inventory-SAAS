package com.inventorysaas.inventory_saas.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductSalesStat {

//    private Long productId;
//    private String sku;
//    private String name;
//    private String categoryName;
//    private Long quantitySold;
//    private BigDecimal totalSalesValue;
//    private Integer transactionCount;
//    private BigDecimal averagePrice;


        private Long productId;
        private String sku;
        private String name;
        private String categoryName;
        private Long quantitySold;        // SUM → Long
        private BigDecimal totalSalesValue; // SUM of mixed → BigDecimal
        private Long transactionCount;    // COUNT → Long
        private Double averagePrice;      // AVG → Double

}
