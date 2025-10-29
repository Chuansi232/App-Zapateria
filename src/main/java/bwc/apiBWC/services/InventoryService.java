package bwc.apiBWC.services;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.StockDto;

import java.util.List;

public interface InventoryService {
    InventoryMovementDto recordInventoryMovement(InventoryMovementDto inventoryMovementDto);
    StockDto getStockByProductAndBranch(Long productId, Long branchId);
    List<StockDto> getStockByBranch(Long branchId);
    List<StockDto> getTotalStockByProduct(Long productId);
}