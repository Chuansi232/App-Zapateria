package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleDetailDto {
    private Long id;
    private Long productId;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
