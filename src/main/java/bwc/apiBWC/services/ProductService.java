// bwc/apiBWC/services/ProductService.java
package bwc.apiBWC.services;

import bwc.apiBWC.dtos.ProductDto;
import java.util.List;

public interface ProductService {
    ProductDto createProduct(ProductDto productDto);
    ProductDto updateProduct(Long id, ProductDto productDto);
    ProductDto getProductById(Long id);
    List<ProductDto> getAllProducts();
    void deleteProduct(Long id);
}