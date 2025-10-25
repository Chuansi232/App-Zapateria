package bwc.apiBWC.services;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.PurchaseDetailDto;
import bwc.apiBWC.dtos.PurchaseDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final DocumentStatusRepository documentStatusRepository;
    private final PaymentStatusRepository paymentStatusRepository;
    private final InventoryService inventoryService;

    @Autowired
    public PurchaseServiceImpl(PurchaseRepository purchaseRepository, ProductRepository productRepository, SupplierRepository supplierRepository, UserRepository userRepository, BranchRepository branchRepository, DocumentStatusRepository documentStatusRepository, PaymentStatusRepository paymentStatusRepository, InventoryService inventoryService) {
        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.documentStatusRepository = documentStatusRepository;
        this.paymentStatusRepository = paymentStatusRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional
    public PurchaseDto createPurchase(PurchaseDto purchaseDto) {
        Purchase purchase = new Purchase();

        Supplier supplier = supplierRepository.findById(purchaseDto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + purchaseDto.getSupplierId()));
        User user = userRepository.findById(purchaseDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + purchaseDto.getUserId()));
        Branch branch = branchRepository.findById(purchaseDto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + purchaseDto.getBranchId()));
        DocumentStatus documentStatus = documentStatusRepository.findById(purchaseDto.getDocumentStatusId())
                .orElseThrow(() -> new ResourceNotFoundException("DocumentStatus not found with id: " + purchaseDto.getDocumentStatusId()));
        PaymentStatus paymentStatus = paymentStatusRepository.findById(purchaseDto.getPaymentStatusId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentStatus not found with id: " + purchaseDto.getPaymentStatusId()));

        purchase.setSupplier(supplier);
        purchase.setUser(user);
        purchase.setBranch(branch);
        purchase.setPurchaseDate(purchaseDto.getPurchaseDate());
        purchase.setTotalAmount(purchaseDto.getTotalAmount());
        purchase.setDocumentStatus(documentStatus);
        purchase.setPaymentStatus(paymentStatus);

        List<PurchaseDetail> purchaseDetails = purchaseDto.getPurchaseDetails().stream().map(detailDto -> {
            PurchaseDetail detail = new PurchaseDetail();
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            detail.setProduct(product);
            detail.setQuantity(detailDto.getQuantity());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setTotalPrice(detailDto.getTotalPrice());
            detail.setPurchase(purchase);
            return detail;
        }).collect(Collectors.toList());

        purchase.setPurchaseDetails(purchaseDetails);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        savedPurchase.getPurchaseDetails().forEach(detail -> {
            InventoryMovementDto inventoryMovementDto = new InventoryMovementDto();
            inventoryMovementDto.setProductId(detail.getProduct().getId());
            inventoryMovementDto.setBranchId(savedPurchase.getBranch().getId());
            inventoryMovementDto.setQuantity(detail.getQuantity());
            inventoryMovementDto.setMovementTypeId(1L); // Assuming 1L is for 'ENTRADA'
            inventoryMovementDto.setUserId(savedPurchase.getUser().getId());
            inventoryMovementDto.setDescription("Purchase #" + savedPurchase.getId());
            inventoryService.recordInventoryMovement(inventoryMovementDto);
        });

        return convertToDto(savedPurchase);
    }

    @Override
    public List<PurchaseDto> getAllPurchases() {
        return purchaseRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public PurchaseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return convertToDto(purchase);
    }

    @Override
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        purchaseRepository.delete(purchase);
    }

    private PurchaseDto convertToDto(Purchase purchase) {
        PurchaseDto dto = new PurchaseDto();
        dto.setId(purchase.getId());
        dto.setSupplierId(purchase.getSupplier() != null ? purchase.getSupplier().getId() : null);
        dto.setUserId(purchase.getUser() != null ? purchase.getUser().getId() : null);
        dto.setBranchId(purchase.getBranch() != null ? purchase.getBranch().getId() : null);
        dto.setPurchaseDate(purchase.getPurchaseDate());
        dto.setTotalAmount(purchase.getTotalAmount());
        dto.setDocumentStatusId(purchase.getDocumentStatus() != null ? purchase.getDocumentStatus().getId() : null);
        dto.setPaymentStatusId(purchase.getPaymentStatus() != null ? purchase.getPaymentStatus().getId() : null);

        if (purchase.getPurchaseDetails() != null) {
            dto.setPurchaseDetails(purchase.getPurchaseDetails().stream().map(detail -> {
                PurchaseDetailDto detailDto = new PurchaseDetailDto();
                detailDto.setId(detail.getId());
                detailDto.setProductId(detail.getProduct() != null ? detail.getProduct().getId() : null);
                detailDto.setQuantity(detail.getQuantity());
                detailDto.setUnitPrice(detail.getUnitPrice());
                detailDto.setTotalPrice(detail.getTotalPrice());
                return detailDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}