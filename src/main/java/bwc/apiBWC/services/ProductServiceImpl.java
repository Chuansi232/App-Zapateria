package bwc.apiBWC.services;

import bwc.apiBWC.dtos.ProductDto;
import bwc.apiBWC.entities.Brand;
import bwc.apiBWC.entities.Category;
import bwc.apiBWC.entities.Product;
import bwc.apiBWC.entities.Size;
import bwc.apiBWC.entities.Stock;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.BrandRepository;
import bwc.apiBWC.repositories.CategoryRepository;
import bwc.apiBWC.repositories.ProductRepository;
import bwc.apiBWC.repositories.SizeRepository;
import bwc.apiBWC.repositories.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private StockRepository stockRepository;

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());

        Brand brand = brandRepository.findById(productDto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        product.setBrand(brand);

        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setCategory(category);

        Set<Size> sizes = new HashSet<>();
        if (productDto.getSizeIds() != null) {
            for (Long sizeId : productDto.getSizeIds()) {
                Size size = sizeRepository.findById(sizeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Size not found"));
                sizes.add(size);
            }
        }
        product.setSizes(sizes);

        // ✅ CORRECCIÓN: Asignar precios antes de guardar
        product.setPurchasePrice(productDto.getPurchasePrice());
        product.setSalePrice(productDto.getSalePrice());

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());

        if (productDto.getBrandId() != null) {
            Brand brand = brandRepository.findById(productDto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
            product.setBrand(brand);
        }

        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (productDto.getSizeIds() != null) {
            Set<Size> sizes = new HashSet<>();
            for (Long sizeId : productDto.getSizeIds()) {
                Size size = sizeRepository.findById(sizeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Size not found"));
                sizes.add(size);
            }
            product.setSizes(sizes);
        }

        // ✅ CORRECCIÓN: Actualizar precios
        product.setPurchasePrice(productDto.getPurchasePrice());
        product.setSalePrice(productDto.getSalePrice());

        Product updatedProduct = productRepository.save(product);
        return convertToDto(updatedProduct);
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return convertToDto(product);
    }

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        
        // Agregar IDs para edición
        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            // Agregar objeto completo para visualización
            ProductDto.BrandDto brandDto = new ProductDto.BrandDto();
            brandDto.setId(product.getBrand().getId());
            brandDto.setName(product.getBrand().getName());
            dto.setBrand(brandDto);
        }
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            // Agregar objeto completo para visualización
            ProductDto.CategoryDto categoryDto = new ProductDto.CategoryDto();
            categoryDto.setId(product.getCategory().getId());
            categoryDto.setName(product.getCategory().getName());
            dto.setCategory(categoryDto);
        }
        
        if (product.getSizes() != null && !product.getSizes().isEmpty()) {
            // Agregar IDs para edición
            dto.setSizeIds(product.getSizes().stream()
                    .map(Size::getId)
                    .collect(Collectors.toSet()));
            
            // Agregar objetos completos para visualización
            Set<ProductDto.SizeDto> sizeDtos = product.getSizes().stream()
                    .map(size -> {
                        ProductDto.SizeDto sizeDto = new ProductDto.SizeDto();
                        sizeDto.setId(size.getId());
                        sizeDto.setName(size.getName());
                        return sizeDto;
                    })
                    .collect(Collectors.toSet());
            dto.setSizes(sizeDtos);
        }
        
        // Calcular stock total (suma de todas las sucursales)
        List<Stock> stockList = stockRepository.findByProductId(product.getId());
        int totalStock = stockList.stream()
                .mapToInt(Stock::getQuantity)
                .sum();
        dto.setStock(totalStock);
        
        // 💥 CORRECCIÓN FINAL: Devolver precios reales de la entidad en lugar de 0
        dto.setPurchasePrice(product.getPurchasePrice());
        dto.setSalePrice(product.getSalePrice());
        
        return dto;
    }
}
