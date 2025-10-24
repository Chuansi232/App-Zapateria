package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.SaleDto;
import bwc.apiBWC.services.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public SaleDto createSale(@RequestBody SaleDto saleDto) {
        return saleService.createSale(saleDto);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<SaleDto> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public SaleDto getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok().build();
    }
}
