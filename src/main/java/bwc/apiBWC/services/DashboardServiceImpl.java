package bwc.apiBWC.services;

import bwc.apiBWC.dtos.DashboardStatsDto;
import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.ProductDto;
import bwc.apiBWC.entities.InventoryMovement;
import bwc.apiBWC.entities.Product;
import bwc.apiBWC.entities.Stock;
import bwc.apiBWC.repositories.InventoryMovementRepository;
import bwc.apiBWC.repositories.SaleRepository;
import bwc.apiBWC.repositories.StockRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.Objects;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public DashboardStatsDto getDashboardStats() {
        // ...existing code...
        double totalSales = saleRepository.findAll().stream()
                .map(sale -> sale.getTotalAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();
        // ...existing code...

        List<Stock> lowStock = stockRepository.findByQuantityLessThanEqual(5);
        List<ProductDto> lowStockProducts = lowStock.stream()
                .map(stock -> modelMapper.map(stock.getProduct(), ProductDto.class))
                .collect(Collectors.toList());

        List<InventoryMovement> recentMovements = inventoryMovementRepository.findTop5ByOrderByMovementDateDesc();
        List<InventoryMovementDto> recentMovementsDto = recentMovements.stream()
                .map(movement -> modelMapper.map(movement, InventoryMovementDto.class))
                .collect(Collectors.toList());

        return new DashboardStatsDto(totalSales, lowStockProducts, recentMovementsDto);
    }
}