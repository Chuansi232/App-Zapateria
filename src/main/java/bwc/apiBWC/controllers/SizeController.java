package bwc.apiBWC.controllers;

import bwc.apiBWC.entities.Size;
import bwc.apiBWC.repositories.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
public class SizeController {

    @Autowired
    private SizeRepository sizeRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR') or hasRole('ALMACENISTA')")
    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Size createSize(@RequestBody Size size) {
        return sizeRepository.save(size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Size getSizeById(@PathVariable Long id) {
        return sizeRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Size not found"));
    }
}