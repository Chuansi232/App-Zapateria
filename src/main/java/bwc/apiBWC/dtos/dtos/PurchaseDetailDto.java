package bwc.apiBWC.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseDetailDto {
    private Long id;

    @NotNull(message = "El ID del producto es requerido")
    private Long productId;

    @NotNull(message = "La cantidad es requerida")
    @DecimalMin(value = "1", message = "La cantidad debe ser al menos 1")
    private Integer quantity;

    @NotNull(message = "El precio unitario es requerido")
    @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor a cero")
    private BigDecimal unitPrice;

    @NotNull(message = "El precio total es requerido")
    @DecimalMin(value = "0.01", message = "El precio total debe ser mayor a cero")
    private BigDecimal totalPrice;
}
