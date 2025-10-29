package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByProductIdAndBranchId(Long productId, Long branchId);
    List<Stock> findByBranchId(Long branchId);
    List<Stock> findByProductId(Long productId);
    List<Stock> findByQuantityLessThanEqual(int quantity);
}