package bwc.apiBWC.services;

import bwc.apiBWC.dtos.BranchDto;
import bwc.apiBWC.dtos.DashboardStatsDto;
import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.ProductDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.repositories.InventoryMovementRepository;
import bwc.apiBWC.repositories.SaleRepository;
import bwc.apiBWC.repositories.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        double totalSales = saleRepository.findAll().stream()
                .map(sale -> sale.getTotalAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

        // Obtener productos con bajo stock (agrupados por producto)
        List<Stock> lowStockList = stockRepository.findByQuantityLessThanEqual(10);
        
        Map<Long, Integer> productStockMap = new HashMap<>();
        Map<Long, Product> productMap = new HashMap<>();
        
        for (Stock stock : lowStockList) {
            if (stock.getProduct() != null) {
                Long productId = stock.getProduct().getId();
                productStockMap.merge(productId, stock.getQuantity(), Integer::sum);
                productMap.put(productId, stock.getProduct());
            }
        }
        
        List<ProductDto> lowStockProducts = productStockMap.entrySet().stream()
                .filter(entry -> entry.getValue() <= 10)
                .map(entry -> {
                    Product product = productMap.get(entry.getKey());
                    ProductDto dto = convertProductToDto(product);
                    dto.setStock(entry.getValue());
                    return dto;
                })
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock()))
                .collect(Collectors.toList());

        // Obtener movimientos recientes
        List<InventoryMovement> recentMovements = inventoryMovementRepository.findTop5ByOrderByMovementDateDesc();
        List<InventoryMovementDto> recentMovementsDto = recentMovements.stream()
                .map(this::convertMovementToDto)
                .collect(Collectors.toList());

        // 🆕 Calcular ventas de la última semana
        List<DashboardStatsDto.SalesChartData> weeklySales = calculateWeeklySales();

        return new DashboardStatsDto(totalSales, lowStockProducts, recentMovementsDto, weeklySales);
    }
    
    // 🆕 Método para calcular ventas de los últimos 7 días
    private List<DashboardStatsDto.SalesChartData> calculateWeeklySales() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(6); // Últimos 7 días incluyendo hoy
        
        // Obtener todas las ventas de la última semana
        List<Sale> weekSales = saleRepository.findAll().stream()
            .filter(sale -> {
                LocalDate saleDate = sale.getSaleDate().toLocalDate();
                return !saleDate.isBefore(startOfWeek) && !saleDate.isAfter(today);
            })
            .collect(Collectors.toList());
        
        // Agrupar ventas por día
        Map<LocalDate, Double> salesByDay = new TreeMap<>();
        
        // Inicializar todos los días con 0
        for (int i = 0; i < 7; i++) {
            LocalDate date = startOfWeek.plusDays(i);
            salesByDay.put(date, 0.0);
        }
        
        // Sumar las ventas de cada día
        for (Sale sale : weekSales) {
            LocalDate saleDate = sale.getSaleDate().toLocalDate();
            double currentTotal = salesByDay.getOrDefault(saleDate, 0.0);
            salesByDay.put(saleDate, currentTotal + sale.getTotalAmount().doubleValue());
        }
        
        // Convertir a la estructura que necesita el frontend
        List<DashboardStatsDto.SalesChartData> chartData = new ArrayList<>();
        Locale locale = new Locale("es", "GT");
        
        for (Map.Entry<LocalDate, Double> entry : salesByDay.entrySet()) {
            String dayName = entry.getKey().getDayOfWeek()
                .getDisplayName(TextStyle.FULL, locale);
            // Capitalizar primera letra
            dayName = dayName.substring(0, 1).toUpperCase() + dayName.substring(1);
            
            DashboardStatsDto.SalesChartData data = new DashboardStatsDto.SalesChartData();
            data.setDay(dayName);
            data.setAmount(Math.round(entry.getValue() * 100.0) / 100.0); // Redondear a 2 decimales
            chartData.add(data);
        }
        
        return chartData;
    }
    
    private ProductDto convertProductToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        
        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            ProductDto.BrandDto brandDto = new ProductDto.BrandDto();
            brandDto.setId(product.getBrand().getId());
            brandDto.setName(product.getBrand().getName());
            dto.setBrand(brandDto);
        }
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            ProductDto.CategoryDto categoryDto = new ProductDto.CategoryDto();
            categoryDto.setId(product.getCategory().getId());
            categoryDto.setName(product.getCategory().getName());
            dto.setCategory(categoryDto);
        }
        
        if (product.getSizes() != null && !product.getSizes().isEmpty()) {
            dto.setSizeIds(product.getSizes().stream()
                    .map(Size::getId)
                    .collect(Collectors.toSet()));
            
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
        
        dto.setPurchasePrice(product.getPurchasePrice());
        dto.setSalePrice(product.getSalePrice());
        
        return dto;
    }
    
    private InventoryMovementDto convertMovementToDto(InventoryMovement movement) {
        InventoryMovementDto dto = new InventoryMovementDto();
        dto.setId(movement.getId());
        
        if (movement.getProduct() != null) {
            dto.setProductId(movement.getProduct().getId());
            dto.setProduct(convertProductToDto(movement.getProduct()));
        }
        
        if (movement.getBranch() != null) {
            dto.setBranchId(movement.getBranch().getId());
            BranchDto branchDto = new BranchDto();
            branchDto.setId(movement.getBranch().getId());
            branchDto.setName(movement.getBranch().getName());
            branchDto.setAddress(movement.getBranch().getAddress());
            branchDto.setPhone(movement.getBranch().getPhone());
            branchDto.setState(movement.getBranch().getState());
            dto.setBranch(branchDto);
        }
        
        if (movement.getMovementType() != null) {
            dto.setMovementTypeId(movement.getMovementType().getId());
            dto.setMovementTypeName(movement.getMovementType().getName());
        }
        
        dto.setQuantity(movement.getQuantity());
        dto.setMovementDate(movement.getMovementDate());
        
        if (movement.getUser() != null) {
            dto.setUserId(movement.getUser().getId());
        }
        
        dto.setDescription(movement.getDescription());
        
        return dto;
    }
}