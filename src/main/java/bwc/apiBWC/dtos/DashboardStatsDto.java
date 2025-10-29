package bwc.apiBWC.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private double totalSales;
    private List<ProductDto> lowStockProducts;
    private List<InventoryMovementDto> recentMovements;
    
    // 🆕 Nuevos campos para el gráfico de ventas
    private List<SalesChartData> weeklySales;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesChartData {
        private String day;
        private double amount;
    }
}