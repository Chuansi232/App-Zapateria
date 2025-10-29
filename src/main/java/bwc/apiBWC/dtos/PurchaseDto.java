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
    
    // IDs para crear/editar
    private Long supplierId;
    private Long userId;
    private Long branchId;
    private Long documentStatusId;
    private Long paymentStatusId;
    
    // Información del proveedor (para crear)
    private String supplierName;
    private String supplierContact;
    private String supplierPhone;
    private String supplierEmail;
    
    private LocalDateTime purchaseDate;
    private BigDecimal totalAmount;
    private List<PurchaseDetailDto> purchaseDetails;
    
    // Objetos completos para mostrar en el frontend
    private SupplierInfo supplier;
    private BranchDto branch;
    private StatusInfo documentStatus;
    private StatusInfo paymentStatus;
    
    // Clases internas para información completa
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierInfo {
        private Long id;
        private String name;
        private String contactName;
        private String phone;
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusInfo {
        private Long id;
        private String name;
    }
}