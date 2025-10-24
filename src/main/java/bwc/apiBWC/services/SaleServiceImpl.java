package bwc.apiBWC.services;

import bwc.apiBWC.dtos.SaleDto;
import bwc.apiBWC.entities.Sale;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.SaleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public SaleDto createSale(SaleDto saleDto) {
        Sale sale = modelMapper.map(saleDto, Sale.class);
        Sale savedSale = saleRepository.save(sale);

        // Update stock for each sale detail
        savedSale.getSaleDetails().forEach(saleDetail -> {
            inventoryService.recordInventoryMovement(
                    new bwc.apiBWC.dtos.InventoryMovementDto(
                            null,
                            saleDetail.getProduct().getId(),
                            savedSale.getBranch().getId(),
                            // Assuming you have a movement type for sale, e.g., 2L for "SALIDA"
                            2L,
                            saleDetail.getQuantity(),
                            savedSale.getSaleDate(),
                            savedSale.getUser().getId(),
                            "Venta de producto"
                    )
            );
        });

        return modelMapper.map(savedSale, SaleDto.class);
    }

    @Override
    public SaleDto getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return modelMapper.map(sale, SaleDto.class);
    }

    @Override
    public List<SaleDto> getAllSales() {
        List<Sale> sales = saleRepository.findAll();
        return sales.stream()
                .map(sale -> modelMapper.map(sale, SaleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSale(Long id) {
        saleRepository.deleteById(id);
    }
}
