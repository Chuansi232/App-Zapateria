package bwc.apiBWC.services;

import bwc.apiBWC.dtos.BranchDto;
import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.ProductDto;
import bwc.apiBWC.dtos.StockDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final MovementTypeRepository movementTypeRepository;
    private final UserRepository userRepository;

    @Autowired
    public InventoryServiceImpl(InventoryMovementRepository inventoryMovementRepository, 
                               StockRepository stockRepository, 
                               ProductRepository productRepository, 
                               BranchRepository branchRepository, 
                               MovementTypeRepository movementTypeRepository, 
                               UserRepository userRepository) {
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
        this.branchRepository = branchRepository;
        this.movementTypeRepository = movementTypeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public InventoryMovementDto recordInventoryMovement(InventoryMovementDto inventoryMovementDto) {
        InventoryMovement movement = new InventoryMovement();
        Product product = productRepository.findById(inventoryMovementDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + inventoryMovementDto.getProductId()));
        Branch branch = branchRepository.findById(inventoryMovementDto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + inventoryMovementDto.getBranchId()));
        MovementType movementType = movementTypeRepository.findById(inventoryMovementDto.getMovementTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("MovementType not found with id: " + inventoryMovementDto.getMovementTypeId()));
        User user = userRepository.findById(inventoryMovementDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + inventoryMovementDto.getUserId()));

        movement.setProduct(product);
        movement.setBranch(branch);
        movement.setQuantity(inventoryMovementDto.getQuantity());
        movement.setMovementType(movementType);
        movement.setMovementDate(LocalDateTime.now());
        movement.setUser(user);
        movement.setDescription(inventoryMovementDto.getDescription());

        movement = inventoryMovementRepository.save(movement);
        
        // ✅ NO actualizar stock aquí porque ya se hace en PurchaseServiceImpl y SaleServiceImpl
        // Solo registrar el movimiento para historial

        return convertMovementToDto(movement);
    }

    // ✅ MÉTODO PÚBLICO para actualizar stock (usado por otros servicios si es necesario)
    @Transactional
    public void updateStockDirect(Long productId, Long branchId, int quantity, String operation) {
        Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
            .orElseGet(() -> {
                Stock newStock = new Stock();
                newStock.setProduct(productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId)));
                newStock.setBranch(branchRepository.findById(branchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId)));
                newStock.setQuantity(0);
                return newStock;
            });

        switch (operation.toUpperCase()) {
            case "ADD":
            case "ENTRADA":
            case "AJUSTE_POSITIVO":
            case "TRANSFERENCIA_ENTRADA":
                stock.setQuantity(stock.getQuantity() + quantity);
                break;
            case "SUBTRACT":
            case "SALIDA":
            case "AJUSTE_NEGATIVO":
            case "TRANSFERENCIA_SALIDA":
                int newQuantity = stock.getQuantity() - quantity;
                if (newQuantity < 0) {
                    throw new IllegalStateException("Stock insuficiente para el producto ID: " + productId + " en sucursal ID: " + branchId);
                }
                stock.setQuantity(newQuantity);
                break;
            default:
                throw new IllegalArgumentException("Operación no válida: " + operation);
        }
        stockRepository.save(stock);
    }

    private InventoryMovementDto convertMovementToDto(InventoryMovement movement) {
        InventoryMovementDto dto = new InventoryMovementDto();
        dto.setId(movement.getId());
        dto.setProductId(movement.getProduct().getId());
        dto.setBranchId(movement.getBranch().getId());
        dto.setMovementTypeId(movement.getMovementType().getId());
        dto.setQuantity(movement.getQuantity());
        dto.setMovementDate(movement.getMovementDate());
        dto.setUserId(movement.getUser().getId());
        dto.setDescription(movement.getDescription());
        return dto;
    }

    @Override
    public StockDto getStockByProductAndBranch(Long productId, Long branchId) {
        Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product id: " + productId + " and branch id: " + branchId));
        return convertStockToDto(stock);
    }

    @Override
    public List<StockDto> getStockByBranch(Long branchId) {
        List<Stock> stockList = stockRepository.findByBranchId(branchId);
        return stockList.stream()
                .map(this::convertStockToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockDto> getTotalStockByProduct(Long productId) {
        List<Stock> stockList = stockRepository.findByProductId(productId);
        return stockList.stream()
                .map(this::convertStockToDto)
                .collect(Collectors.toList());
    }

    private StockDto convertStockToDto(Stock stock) {
        StockDto dto = new StockDto();
        dto.setId(stock.getId());
        dto.setProductId(stock.getProduct() != null ? stock.getProduct().getId() : null);
        dto.setBranchId(stock.getBranch() != null ? stock.getBranch().getId() : null);
        dto.setQuantity(stock.getQuantity());
        
        // Agregar información completa del producto
        if (stock.getProduct() != null) {
            ProductDto productDto = new ProductDto();
            Product product = stock.getProduct();
            
            productDto.setId(product.getId());
            productDto.setName(product.getName());
            productDto.setDescription(product.getDescription());
            productDto.setPurchasePrice(product.getPurchasePrice());
            productDto.setSalePrice(product.getSalePrice());
            
            if (product.getBrand() != null) {
                ProductDto.BrandDto brandDto = new ProductDto.BrandDto();
                brandDto.setId(product.getBrand().getId());
                brandDto.setName(product.getBrand().getName());
                productDto.setBrand(brandDto);
            }
            
            if (product.getCategory() != null) {
                ProductDto.CategoryDto categoryDto = new ProductDto.CategoryDto();
                categoryDto.setId(product.getCategory().getId());
                categoryDto.setName(product.getCategory().getName());
                productDto.setCategory(categoryDto);
            }
            
            if (product.getSizes() != null && !product.getSizes().isEmpty()) {
                productDto.setSizes(product.getSizes().stream()
                    .map(size -> {
                        ProductDto.SizeDto sizeDto = new ProductDto.SizeDto();
                        sizeDto.setId(size.getId());
                        sizeDto.setName(size.getName());
                        return sizeDto;
                    })
                    .collect(Collectors.toSet()));
            }
            
            dto.setProduct(productDto);
        }
        
        // Agregar información de la sucursal
        if (stock.getBranch() != null) {
            BranchDto branchDto = new BranchDto();
            branchDto.setId(stock.getBranch().getId());
            branchDto.setName(stock.getBranch().getName());
            branchDto.setAddress(stock.getBranch().getAddress());
            branchDto.setPhone(stock.getBranch().getPhone());
            branchDto.setState(stock.getBranch().getState());
            dto.setBranch(branchDto);
        }
        
        return dto;
    }
}