package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.PurchaseDto;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.services.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> createPurchase(@RequestBody PurchaseDto purchaseDto) {
        try {
            PurchaseDto createdPurchase = purchaseService.createPurchase(purchaseDto);
            // Respuesta 201 Created para la creación exitosa
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPurchase); 
        } catch (DataIntegrityViolationException e) {
            // Maneja la violación de unicidad (e.g., email duplicado del proveedor)
            String detail = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
            String errorMessage = "Error de base de datos. Probablemente el proveedor ya existe o hay otra restricción violada. Detalle: " + detail;
            // Respuesta 409 Conflict para violación de unicidad
            return ResponseEntity
                .status(HttpStatus.CONFLICT) 
                .body(errorMessage);
        } catch (ResourceNotFoundException e) {
            // Maneja recursos no encontrados (Usuario, Producto, Sucursal, etc.)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); 
        } catch (IllegalArgumentException e) {
            // Maneja datos de entrada inválidos (e.g., la validación del proveedor)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); 
        } catch (Exception e) {
            // Captura cualquier otro error inesperado 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado: " + e.getMessage());
        }
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