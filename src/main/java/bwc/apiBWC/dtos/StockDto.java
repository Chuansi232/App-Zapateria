package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    private Long id;
    private Long productId;
    private Long branchId;
    private int quantity;
}
