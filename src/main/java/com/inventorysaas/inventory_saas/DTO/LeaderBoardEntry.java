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
public class LeaderBoardEntry {

    private Integer rank;
    private String tenantId;
    private String companyName;
    private BigDecimal score;
    private String metrics; //sales or inventory value
}
