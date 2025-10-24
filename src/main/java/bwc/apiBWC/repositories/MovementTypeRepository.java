package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovementTypeRepository extends JpaRepository<MovementType, Long> {
}
