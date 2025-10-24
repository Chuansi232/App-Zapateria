package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.PurchaseDto;
import bwc.apiBWC.services.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public PurchaseDto createPurchase(@RequestBody PurchaseDto purchaseDto) {
        return purchaseService.createPurchase(purchaseDto);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<PurchaseDto> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public PurchaseDto getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.ok().build();
    }
}
