package bwc.apiBWC.dtos;

import java.util.List;

public class DashboardStatsDto {
    private double totalSales;
    private List<ProductDto> lowStockProducts;
    private List<InventoryMovementDto> recentMovements;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(double totalSales, List<ProductDto> lowStockProducts, List<InventoryMovementDto> recentMovements) {
        this.totalSales = totalSales;
        this.lowStockProducts = lowStockProducts;
        this.recentMovements = recentMovements;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public List<ProductDto> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductDto> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<InventoryMovementDto> getRecentMovements() {
        return recentMovements;
    }

    public void setRecentMovements(List<InventoryMovementDto> recentMovements) {
        this.recentMovements = recentMovements;
    }
}
