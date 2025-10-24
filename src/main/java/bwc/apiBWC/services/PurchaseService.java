package bwc.apiBWC.services;

import bwc.apiBWC.dtos.PurchaseDto;

import java.util.List;

public interface PurchaseService {
    PurchaseDto createPurchase(PurchaseDto purchaseDto);
    PurchaseDto getPurchaseById(Long id);
    List<PurchaseDto> getAllPurchases();
    void deletePurchase(Long id);
}
