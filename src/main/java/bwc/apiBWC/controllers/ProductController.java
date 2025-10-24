package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.ProductDto;
import bwc.apiBWC.entities.Product;
import bwc.apiBWC.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(product -> modelMapper.map(product, ProductDto.class))
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductDto createProduct(@RequestBody ProductDto productDto) {
        Product product = modelMapper.map(productDto, Product.class);
        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDto.class);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public ProductDto getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Product not found with id: " + id));
        return modelMapper.map(product, ProductDto.class);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductDto updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Product not found with id: " + id));
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        // Update other fields as needed
        Product updatedProduct = productRepository.save(product);
        return modelMapper.map(updatedProduct, ProductDto.class);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
