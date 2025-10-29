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
@CrossOrigin(origins = "*", maxAge = 3600)
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public ResponseEntity<SaleDto> createSale(@RequestBody SaleDto saleDto) {
        try {
            SaleDto createdSale = saleService.createSale(saleDto);
            return ResponseEntity.ok(createdSale);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear la venta: " + e.getMessage());
        }
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