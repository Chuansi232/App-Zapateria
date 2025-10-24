package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.StockDto;
import bwc.apiBWC.services.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/movements")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public InventoryMovementDto recordInventoryMovement(@RequestBody InventoryMovementDto inventoryMovementDto) {
        return inventoryService.recordInventoryMovement(inventoryMovementDto);
    }

    @GetMapping("/stock")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public StockDto getStockByProductAndBranch(@RequestParam Long productId, @RequestParam Long branchId) {
        return inventoryService.getStockByProductAndBranch(productId, branchId);
    }

    @GetMapping("/stock/branch/{branchId}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<StockDto> getStockByBranch(@PathVariable Long branchId) {
        return inventoryService.getStockByBranch(branchId);
    }

    @GetMapping("/stock/product/{productId}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<StockDto> getTotalStockByProduct(@PathVariable Long productId) {
        return inventoryService.getTotalStockByProduct(productId);
    }
}
