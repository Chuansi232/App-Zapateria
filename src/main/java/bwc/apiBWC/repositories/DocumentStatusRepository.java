package bwc.apiBWC.repositories;

import bwc.apiBWC.entities.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentStatusRepository extends JpaRepository<DocumentStatus, Long> {
}
