package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    
    // Para enviar al backend (IDs)
    private Long brandId;
    private Long categoryId;
    private Set<Long> sizeIds;
    
    // Para recibir del backend (objetos completos)
    private BrandDto brand;
    private CategoryDto category;
    private Set<SizeDto> sizes;
    
    // Precios y stock
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Integer stock;
    
    // DTOs internos para las relaciones
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandDto {
        private Long id;
        private String name;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private String name;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SizeDto {
        private Long id;
        private String name;
    }
}