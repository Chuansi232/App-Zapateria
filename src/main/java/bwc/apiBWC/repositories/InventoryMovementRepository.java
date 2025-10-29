package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    InventoryMovement findFirstByProductId(Long productId);
    InventoryMovement findFirstByBranchId(Long branchId);
    List<InventoryMovement> findTop5ByOrderByMovementDateDesc();
}