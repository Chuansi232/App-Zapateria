package bwc.apiBWC.services;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.StockDto;
import bwc.apiBWC.entities.InventoryMovement;
import bwc.apiBWC.entities.Stock;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.InventoryMovementRepository;
import bwc.apiBWC.repositories.StockRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public InventoryMovementDto recordInventoryMovement(InventoryMovementDto inventoryMovementDto) {
        // Convert DTO to entity
        InventoryMovement inventoryMovement = modelMapper.map(inventoryMovementDto, InventoryMovement.class);

        // Save the movement
        InventoryMovement savedMovement = inventoryMovementRepository.save(inventoryMovement);

        // Update stock
        updateStock(inventoryMovement.getProduct().getId(), inventoryMovement.getBranch().getId(), inventoryMovement.getQuantity(), inventoryMovement.getMovementType().getName());

        // Convert entity to DTO and return
        return modelMapper.map(savedMovement, InventoryMovementDto.class);
    }

    @Override
    public StockDto getStockByProductAndBranch(Long productId, Long branchId) {
        Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product id: " + productId + " and branch id: " + branchId));
        return modelMapper.map(stock, StockDto.class);
    }

    @Override
    public List<StockDto> getStockByBranch(Long branchId) {
        List<Stock> stockList = stockRepository.findByBranchId(branchId);
        return stockList.stream()
                .map(stock -> modelMapper.map(stock, StockDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StockDto> getTotalStockByProduct(Long productId) {
        List<Stock> stockList = stockRepository.findByProductId(productId);
        return stockList.stream()
                .map(stock -> modelMapper.map(stock, StockDto.class))
                .collect(Collectors.toList());
    }

    private void updateStock(Long productId, Long branchId, int quantity, String movementType) {
        Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
                .orElse(new Stock(null, null, null, 0));

        if (stock.getProduct() == null) {
            // Product and Branch will be set by the inventoryMovement entity
            stock.setProduct(inventoryMovementRepository.findFirstByProductId(productId).getProduct());
            stock.setBranch(inventoryMovementRepository.findFirstByBranchId(branchId).getBranch());
        }

        switch (movementType) {
            case "ENTRADA":
            case "AJUSTE_POSITIVO":
            case "TRANSFERENCIA_ENTRADA":
                stock.setQuantity(stock.getQuantity() + quantity);
                break;
            case "SALIDA":
            case "AJUSTE_NEGATIVO":
            case "TRANSFERENCIA_SALIDA":
                stock.setQuantity(stock.getQuantity() - quantity);
                break;
        }
        stockRepository.save(stock);
    }
}
