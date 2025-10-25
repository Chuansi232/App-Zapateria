package bwc.apiBWC.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "El ID del cliente es requerido")
    private Long customerId;

    @NotNull(message = "El ID del usuario es requerido")
    private Long userId;

    @NotNull(message = "El ID de la sucursal es requerido")
    private Long branchId;

    @NotNull(message = "La fecha de venta es requerida")
    private LocalDateTime saleDate;

    @NotNull(message = "El monto total es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal totalAmount;

    @NotNull(message = "El estado del documento es requerido")
    private Long documentStatusId;

    @NotEmpty(message = "Debe haber al menos un detalle de venta")
    @Valid
    private List<SaleDetailDto> saleDetails;
}
