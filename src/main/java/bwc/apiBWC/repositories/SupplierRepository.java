package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    // 🆕 Nuevo método: Lo usaremos para buscar antes de crear
    Optional<Supplier> findByEmail(String email);
}