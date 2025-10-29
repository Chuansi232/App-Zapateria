package bwc.apiBWC.services;

import bwc.apiBWC.security.UserDetailsImpl;
import bwc.apiBWC.dtos.BranchDto;
import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.PurchaseDetailDto;
import bwc.apiBWC.dtos.PurchaseDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; 
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
    private final StockRepository stockRepository;

    @Autowired
    public PurchaseServiceImpl(PurchaseRepository purchaseRepository, 
                               ProductRepository productRepository, 
                               SupplierRepository supplierRepository, 
                               UserRepository userRepository, 
                               BranchRepository branchRepository, 
                               DocumentStatusRepository documentStatusRepository, 
                               PaymentStatusRepository paymentStatusRepository, 
                               InventoryService inventoryService,
                               StockRepository stockRepository) {
        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.documentStatusRepository = documentStatusRepository;
        this.paymentStatusRepository = paymentStatusRepository;
        this.inventoryService = inventoryService;
        this.stockRepository = stockRepository;
    }

    @Override
    @Transactional
    public PurchaseDto createPurchase(PurchaseDto purchaseDto) {
        Purchase purchase = new Purchase();

        // Lógica para manejar el proveedor
        Supplier supplier;
        if (purchaseDto.getSupplierId() != null) {
            supplier = supplierRepository.findById(purchaseDto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + purchaseDto.getSupplierId()));
        } else if (purchaseDto.getSupplierEmail() != null && !purchaseDto.getSupplierEmail().trim().isEmpty()) {
            Optional<Supplier> existingSupplier = supplierRepository.findByEmail(purchaseDto.getSupplierEmail());
            
            if (existingSupplier.isPresent()) {
                supplier = existingSupplier.get();
            } else {
                supplier = new Supplier();
                supplier.setName(purchaseDto.getSupplierName());
                supplier.setContactName(purchaseDto.getSupplierContact());
                supplier.setPhone(purchaseDto.getSupplierPhone());
                supplier.setEmail(purchaseDto.getSupplierEmail());
                supplier = supplierRepository.save(supplier); 
            }
        } else {
            throw new IllegalArgumentException("Debe proporcionar un supplierId o supplierEmail válido");
        }

        // Obtener usuario autenticado
        User user;
        if (purchaseDto.getUserId() != null) {
            user = userRepository.findById(purchaseDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + purchaseDto.getUserId()));
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                user = userRepository.findById(userDetails.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            } else {
                throw new IllegalArgumentException("No se pudo determinar el usuario");
            }
        }

        Branch branch = branchRepository.findById(purchaseDto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + purchaseDto.getBranchId()));

        DocumentStatus documentStatus;
        if (purchaseDto.getDocumentStatusId() != null) {
            documentStatus = documentStatusRepository.findById(purchaseDto.getDocumentStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("DocumentStatus not found"));
        } else {
            documentStatus = documentStatusRepository.findById(1L)
                    .orElse(documentStatusRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("No document status available")));
        }

        PaymentStatus paymentStatus;
        if (purchaseDto.getPaymentStatusId() != null) {
            paymentStatus = paymentStatusRepository.findById(purchaseDto.getPaymentStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("PaymentStatus not found"));
        } else {
            paymentStatus = paymentStatusRepository.findById(1L)
                    .orElse(paymentStatusRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("No payment status available")));
        }

        purchase.setSupplier(supplier);
        purchase.setUser(user);
        purchase.setBranch(branch);
        purchase.setPurchaseDate(purchaseDto.getPurchaseDate() != null ? purchaseDto.getPurchaseDate() : LocalDateTime.now());
        purchase.setTotalAmount(purchaseDto.getTotalAmount());
        purchase.setDocumentStatus(documentStatus);
        purchase.setPaymentStatus(paymentStatus);

        // Procesar detalles de compra
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

        // Actualizar stock directamente
        savedPurchase.getPurchaseDetails().forEach(detail -> {
            Long productId = detail.getProduct().getId();
            Long branchId = savedPurchase.getBranch().getId();
            int quantity = detail.getQuantity();
            
            // Buscar o crear stock
            Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setProduct(detail.getProduct());
                    newStock.setBranch(savedPurchase.getBranch());
                    newStock.setQuantity(0);
                    return newStock;
                });
            
            // Incrementar cantidad
            stock.setQuantity(stock.getQuantity() + quantity);
            stockRepository.save(stock);
            
            // Registrar movimiento de inventario
            InventoryMovementDto inventoryMovementDto = new InventoryMovementDto();
            inventoryMovementDto.setProductId(productId);
            inventoryMovementDto.setBranchId(branchId);
            inventoryMovementDto.setQuantity(quantity);
            inventoryMovementDto.setMovementTypeId(1L); // 1 = ENTRADA
            inventoryMovementDto.setUserId(savedPurchase.getUser().getId());
            inventoryMovementDto.setDescription("Compra #" + savedPurchase.getId());
            inventoryService.recordInventoryMovement(inventoryMovementDto);
        });

        return convertToDtoWithFullInfo(savedPurchase);
    }

    @Override
    public List<PurchaseDto> getAllPurchases() {
        List<Purchase> purchases = purchaseRepository.findAll();
        return purchases.stream()
                .map(this::convertToDtoWithFullInfo)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return convertToDtoWithFullInfo(purchase);
    }

    @Override
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        purchaseRepository.delete(purchase);
    }

    // Método mejorado que incluye toda la información
    private PurchaseDto convertToDtoWithFullInfo(Purchase purchase) {
        PurchaseDto dto = new PurchaseDto();
        dto.setId(purchase.getId());
        
        // IDs para referencias
        if (purchase.getSupplier() != null) {
            dto.setSupplierId(purchase.getSupplier().getId());
            dto.setSupplierName(purchase.getSupplier().getName());
            
            // Objeto completo del proveedor
            PurchaseDto.SupplierInfo supplierInfo = new PurchaseDto.SupplierInfo();
            supplierInfo.setId(purchase.getSupplier().getId());
            supplierInfo.setName(purchase.getSupplier().getName());
            supplierInfo.setContactName(purchase.getSupplier().getContactName());
            supplierInfo.setPhone(purchase.getSupplier().getPhone());
            supplierInfo.setEmail(purchase.getSupplier().getEmail());
            dto.setSupplier(supplierInfo);
        }
        
        if (purchase.getUser() != null) {
            dto.setUserId(purchase.getUser().getId());
        }
        
        // Información completa de la sucursal
        if (purchase.getBranch() != null) {
            dto.setBranchId(purchase.getBranch().getId());
            
            BranchDto branchDto = new BranchDto();
            branchDto.setId(purchase.getBranch().getId());
            branchDto.setName(purchase.getBranch().getName());
            branchDto.setAddress(purchase.getBranch().getAddress());
            branchDto.setPhone(purchase.getBranch().getPhone());
            branchDto.setState(purchase.getBranch().getState());
            dto.setBranch(branchDto);
        }
        
        dto.setPurchaseDate(purchase.getPurchaseDate());
        dto.setTotalAmount(purchase.getTotalAmount());
        
        // Estados completos
        if (purchase.getDocumentStatus() != null) {
            dto.setDocumentStatusId(purchase.getDocumentStatus().getId());
            
            PurchaseDto.StatusInfo docStatus = new PurchaseDto.StatusInfo();
            docStatus.setId(purchase.getDocumentStatus().getId());
            docStatus.setName(purchase.getDocumentStatus().getName());
            dto.setDocumentStatus(docStatus);
        }
        
        if (purchase.getPaymentStatus() != null) {
            dto.setPaymentStatusId(purchase.getPaymentStatus().getId());
            
            PurchaseDto.StatusInfo payStatus = new PurchaseDto.StatusInfo();
            payStatus.setId(purchase.getPaymentStatus().getId());
            payStatus.setName(purchase.getPaymentStatus().getName());
            dto.setPaymentStatus(payStatus);
        }

        // Detalles de la compra
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