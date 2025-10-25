package bwc.apiBWC.services;

import bwc.apiBWC.dtos.InventoryMovementDto;
import bwc.apiBWC.dtos.SaleDetailDto;
import bwc.apiBWC.dtos.SaleDto;
import bwc.apiBWC.entities.*;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final DocumentStatusRepository documentStatusRepository;
    private final InventoryService inventoryService;

    @Autowired
    public SaleServiceImpl(SaleRepository saleRepository, ProductRepository productRepository, CustomerRepository customerRepository, UserRepository userRepository, BranchRepository branchRepository, DocumentStatusRepository documentStatusRepository, InventoryService inventoryService) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.documentStatusRepository = documentStatusRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional
    public SaleDto createSale(SaleDto saleDto) {
        Sale sale = new Sale();

        Customer customer = customerRepository.findById(saleDto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + saleDto.getCustomerId()));
        User user = userRepository.findById(saleDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + saleDto.getUserId()));
        Branch branch = branchRepository.findById(saleDto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + saleDto.getBranchId()));
        DocumentStatus documentStatus = documentStatusRepository.findById(saleDto.getDocumentStatusId())
                .orElseThrow(() -> new ResourceNotFoundException("DocumentStatus not found with id: " + saleDto.getDocumentStatusId()));

        sale.setCustomer(customer);
        sale.setUser(user);
        sale.setBranch(branch);
        sale.setSaleDate(saleDto.getSaleDate());
        sale.setTotalAmount(saleDto.getTotalAmount());
        sale.setDocumentStatus(documentStatus);

        List<SaleDetail> saleDetails = saleDto.getSaleDetails().stream().map(detailDto -> {
            SaleDetail detail = new SaleDetail();
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            detail.setProduct(product);
            detail.setQuantity(detailDto.getQuantity());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setTotalPrice(detailDto.getTotalPrice());
            detail.setSale(sale);
            return detail;
        }).collect(Collectors.toList());

        sale.setSaleDetails(saleDetails);
        Sale savedSale = saleRepository.save(sale);

        savedSale.getSaleDetails().forEach(detail -> {
            InventoryMovementDto inventoryMovementDto = new InventoryMovementDto();
            inventoryMovementDto.setProductId(detail.getProduct().getId());
            inventoryMovementDto.setBranchId(savedSale.getBranch().getId());
            inventoryMovementDto.setQuantity(detail.getQuantity());
            inventoryMovementDto.setMovementTypeId(2L); // Assuming 2L is for 'SALIDA'
            inventoryMovementDto.setUserId(savedSale.getUser().getId());
            inventoryMovementDto.setDescription("Sale #" + savedSale.getId());
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