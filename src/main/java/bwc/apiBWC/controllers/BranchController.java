package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.BranchDto;
import bwc.apiBWC.entities.Branch;
import bwc.apiBWC.repositories.BranchRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ModelMapper modelMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public List<BranchDto> getAllBranches() {
        List<Branch> branches = branchRepository.findAll();
        return branches.stream()
                .map(branch -> modelMapper.map(branch, BranchDto.class))
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public BranchDto createBranch(@RequestBody BranchDto branchDto) {
        Branch branch = modelMapper.map(branchDto, Branch.class);
        // Asegurarse de que state tenga un valor por defecto
        if (branch.getState() == null) {
            branch.setState(true);
        }
        Branch savedBranch = branchRepository.save(branch);
        return modelMapper.map(savedBranch, BranchDto.class);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR')")
    public BranchDto getBranchById(@PathVariable Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Branch not found with id: " + id));
        return modelMapper.map(branch, BranchDto.class);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public BranchDto updateBranch(@PathVariable Long id, @RequestBody BranchDto branchDto) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Branch not found with id: " + id));
        
        branch.setName(branchDto.getName());
        branch.setAddress(branchDto.getAddress());
        branch.setPhone(branchDto.getPhone());
        
        // Actualizar el estado correctamente
        if (branchDto.getState() != null) {
            branch.setState(branchDto.getState());
        }
        
        Branch updatedBranch = branchRepository.save(branch);
        return modelMapper.map(updatedBranch, BranchDto.class);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> deleteBranch(@PathVariable Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new bwc.apiBWC.exceptions.ResourceNotFoundException("Branch not found with id: " + id));
        branchRepository.delete(branch);
        return ResponseEntity.ok().build();
    }
}