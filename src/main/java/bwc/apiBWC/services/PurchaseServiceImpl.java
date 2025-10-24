package bwc.apiBWC.services;

import bwc.apiBWC.dtos.PurchaseDto;
import bwc.apiBWC.entities.Purchase;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.PurchaseRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseServiceImpl implements PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public PurchaseDto createPurchase(PurchaseDto purchaseDto) {
        Purchase purchase = modelMapper.map(purchaseDto, Purchase.class);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Update stock for each purchase detail
        savedPurchase.getPurchaseDetails().forEach(purchaseDetail -> {
            inventoryService.recordInventoryMovement(
                    new bwc.apiBWC.dtos.InventoryMovementDto(
                            null,
                            purchaseDetail.getProduct().getId(),
                            savedPurchase.getBranch().getId(),
                            // Assuming you have a movement type for purchase, e.g., 1L for "ENTRADA"
                            1L,
                            purchaseDetail.getQuantity(),
                            savedPurchase.getPurchaseDate(),
                            savedPurchase.getUser().getId(),
                            "Compra de producto"
                    )
            );
        });

        return modelMapper.map(savedPurchase, PurchaseDto.class);
    }

    @Override
    public PurchaseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return modelMapper.map(purchase, PurchaseDto.class);
    }

    @Override
    public List<PurchaseDto> getAllPurchases() {
        List<Purchase> purchases = purchaseRepository.findAll();
        return purchases.stream()
                .map(purchase -> modelMapper.map(purchase, PurchaseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }
}
