package bwc.apiBWC.services;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.SaleDetailDto;
import bwc.apiBWC.dtos.SaleDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.*;
import bwc.apiBWC.security.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication; 
import org.springframework.security.core.context.SecurityContextHolder; 

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final DocumentStatusRepository documentStatusRepository;
    private final InventoryService inventoryService;
    private final StockRepository stockRepository; // ✅ AÑADIDO

    @Autowired
    public SaleServiceImpl(SaleRepository saleRepository, 
                          ProductRepository productRepository, 
                          CustomerRepository customerRepository, 
                          UserRepository userRepository, 
                          BranchRepository branchRepository, 
                          DocumentStatusRepository documentStatusRepository, 
                          InventoryService inventoryService,
                          StockRepository stockRepository) { // ✅ AÑADIDO
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.documentStatusRepository = documentStatusRepository;
        this.inventoryService = inventoryService;
        this.stockRepository = stockRepository; // ✅ AÑADIDO
    }

    @Override
    @Transactional
    public SaleDto createSale(SaleDto saleDto) {
        Sale sale = new Sale();

        // 1. OBTENER ID DEL USUARIO DESDE SPRING SECURITY
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); 
        Long currentUserId = userDetails.getId(); 

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));

        // 2. MANEJAR EL CLIENTE
        Customer customer;
        if (saleDto.getCustomerName() != null && !saleDto.getCustomerName().trim().isEmpty()) {
            Customer newCustomer = new Customer();
            newCustomer.setFirstName(saleDto.getCustomerName()); 
            newCustomer.setLastName(""); 
            newCustomer.setEmail(saleDto.getCustomerEmail()); 
            newCustomer.setPhone(saleDto.getCustomerPhone()); 
            customer = customerRepository.save(newCustomer);
        } else {
            customer = customerRepository.findById(1L) 
                    .orElseThrow(() -> new ResourceNotFoundException("Customer General (ID 1L) not found. Please initialize this customer."));
        }
        
        // 3. OBTENER SUCURSAL
        Branch branch = branchRepository.findById(saleDto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + saleDto.getBranchId()));
        
        // 4. ESTABLECER DOCUMENT STATUS
        Long initialStatusId = 1L; 
        DocumentStatus documentStatus = documentStatusRepository.findById(initialStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Initial Document Status (ID 1L) not found. Check DataInitializer."));

        sale.setCustomer(customer);
        sale.setUser(user);
        sale.setBranch(branch);
        sale.setSaleDate(LocalDateTime.now()); 
        sale.setTotalAmount(saleDto.getTotalAmount());
        sale.setDocumentStatus(documentStatus);

        // ✅ VALIDAR STOCK ANTES DE CREAR LA VENTA
        for (SaleDetailDto detailDto : saleDto.getSaleDetails()) {
            Stock stock = stockRepository.findByProductIdAndBranchId(detailDto.getProductId(), branch.getId())
                .orElseThrow(() -> new IllegalStateException("No hay stock disponible para el producto ID: " + detailDto.getProductId() + " en esta sucursal"));
            
            if (stock.getQuantity() < detailDto.getQuantity()) {
                Product product = productRepository.findById(detailDto.getProductId()).orElse(null);
                String productName = product != null ? product.getName() : "ID " + detailDto.getProductId();
                throw new IllegalStateException("Stock insuficiente para " + productName + ". Disponible: " + stock.getQuantity() + ", Requerido: " + detailDto.getQuantity());
            }
        }

        List<SaleDetail> saleDetails = saleDto.getSaleDetails().stream().map(detailDto -> {
            SaleDetail detail = new SaleDetail();
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            
            detail.setProduct(product);
            detail.setQuantity(detailDto.getQuantity());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setTotalPrice(detailDto.getTotalPrice() != null ? detailDto.getTotalPrice() : BigDecimal.valueOf(detailDto.getQuantity()).multiply(detailDto.getUnitPrice()));
            detail.setSale(sale);
            return detail;
        }).collect(Collectors.toList());

        sale.setSaleDetails(saleDetails);
        Sale savedSale = saleRepository.save(sale);

        // ✅ ACTUALIZAR STOCK DIRECTAMENTE
        savedSale.getSaleDetails().forEach(detail -> {
            Long productId = detail.getProduct().getId();
            Long branchId = savedSale.getBranch().getId();
            int quantity = detail.getQuantity();
            
            // Buscar stock existente
            Stock stock = stockRepository.findByProductIdAndBranchId(productId, branchId)
                .orElseThrow(() -> new IllegalStateException("No se encontró stock para el producto ID: " + productId));
            
            // Decrementar cantidad
            int newQuantity = stock.getQuantity() - quantity;
            if (newQuantity < 0) {
                throw new IllegalStateException("Error al actualizar stock. Cantidad negativa.");
            }
            stock.setQuantity(newQuantity);
            stockRepository.save(stock);
            
            // Registrar movimiento de inventario
            InventoryMovementDto inventoryMovementDto = new InventoryMovementDto();
            inventoryMovementDto.setProductId(productId);
            inventoryMovementDto.setBranchId(branchId);
            inventoryMovementDto.setQuantity(quantity);
            inventoryMovementDto.setMovementTypeId(2L); // 2L = SALIDA
            inventoryMovementDto.setUserId(savedSale.getUser().getId());
            inventoryMovementDto.setDescription("Venta #" + savedSale.getId());
            inventoryService.recordInventoryMovement(inventoryMovementDto);
        });

        return convertToDto(savedSale);
    }

    @Override
    public List<SaleDto> getAllSales() {
        return saleRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public SaleDto getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return convertToDto(sale);
    }

    @Override
    public void deleteSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        saleRepository.delete(sale);
    }

    private SaleDto convertToDto(Sale sale) {
        SaleDto saleDto = new SaleDto();
        saleDto.setId(sale.getId());
        saleDto.setCustomerId(sale.getCustomer() != null ? sale.getCustomer().getId() : null);
        saleDto.setUserId(sale.getUser() != null ? sale.getUser().getId() : null);
        saleDto.setBranchId(sale.getBranch() != null ? sale.getBranch().getId() : null);
        saleDto.setSaleDate(sale.getSaleDate());
        saleDto.setTotalAmount(sale.getTotalAmount());
        saleDto.setDocumentStatusId(sale.getDocumentStatus() != null ? sale.getDocumentStatus().getId() : null);

        if (sale.getCustomer() != null) {
            String firstName = sale.getCustomer().getFirstName();
            String lastName = sale.getCustomer().getLastName();
            String fullName = firstName + (lastName != null && !lastName.isEmpty() ? " " + lastName : "");
            saleDto.setCustomerName(fullName.trim());
            saleDto.setCustomerEmail(sale.getCustomer().getEmail());
            saleDto.setCustomerPhone(sale.getCustomer().getPhone());
        }

        if (sale.getSaleDetails() != null) {
            saleDto.setSaleDetails(sale.getSaleDetails().stream().map(detail -> {
                SaleDetailDto detailDto = new SaleDetailDto();
                detailDto.setId(detail.getId());
                detailDto.setProductId(detail.getProduct() != null ? detail.getProduct().getId() : null);
                detailDto.setQuantity(detail.getQuantity());
                detailDto.setUnitPrice(detail.getUnitPrice());
                detailDto.setTotalPrice(detail.getTotalPrice());
                return detailDto;
            }).collect(Collectors.toList()));
        }
        return saleDto;
    }
}