package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    InventoryMovement findFirstByProductId(Long productId);
    InventoryMovement findFirstByBranchId(Long branchId);
}
