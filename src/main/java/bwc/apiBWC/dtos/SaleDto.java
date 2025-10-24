package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleDto {
    private Long id;
    private Long customerId;
    private Long userId;
    private Long branchId;
    private LocalDateTime saleDate;
    private BigDecimal totalAmount;
    private Long documentStatusId;
    private List<SaleDetailDto> saleDetails;
}
