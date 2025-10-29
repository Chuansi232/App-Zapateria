package bwc.apiBWC.controllers;

import bwc.apiBWC.entities.Brand;
import bwc.apiBWC.repositories.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Brand createBrand(@RequestBody Brand brand) {
        return brandRepository.save(brand);
    }
}