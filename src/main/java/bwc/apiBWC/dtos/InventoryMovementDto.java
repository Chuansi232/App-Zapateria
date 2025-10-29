package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementDto {
    private Long id;
    private Long productId;
    private Long branchId;
    private Long movementTypeId;
    private int quantity;
    private LocalDateTime movementDate;
    private Long userId;
    private String description;
    
    // Información completa para el dashboard
    private ProductDto product;
    private BranchDto branch;
    private String movementTypeName;
}