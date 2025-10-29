package bwc.apiBWC.services;

import bwc.apiBWC.dtos.BranchDto;
import java.util.List;

public interface BranchService {
    List<BranchDto> getBranches();
    BranchDto getBranchById(Long id);
    BranchDto createBranch(BranchDto branchDto);
    BranchDto updateBranch(Long id, BranchDto branchDto);
    void deleteBranch(Long id);
}
