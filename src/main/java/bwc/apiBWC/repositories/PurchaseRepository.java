package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.Purchase;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @EntityGraph(attributePaths = {"branch", "supplier", "paymentStatus", "documentStatus"})
    List<Purchase> findAll();

    @EntityGraph(attributePaths = {"branch", "supplier", "paymentStatus", "documentStatus"})
    Purchase findWithRelationsById(Long id);
}
