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
public class PurchaseDto {
    private Long id;
    private Long supplierId;
    private Long userId;
    private Long branchId;
    private LocalDateTime purchaseDate;
    private BigDecimal totalAmount;
    private Long documentStatusId;
    private Long paymentStatusId;
    private List<PurchaseDetailDto> purchaseDetails;
}
