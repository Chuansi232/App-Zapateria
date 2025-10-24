package bwc.apiBWC.services;

import bwc.apiBWC.dtos.SaleDto;

import java.util.List;

public interface SaleService {
    SaleDto createSale(SaleDto saleDto);
    SaleDto getSaleById(Long id);
    List<SaleDto> getAllSales();
    void deleteSale(Long id);
}
