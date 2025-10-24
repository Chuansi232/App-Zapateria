package bwc.apiBWC.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne
    @JoinColumn(name = "movement_type_id", nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "movement_date", nullable = false)
    private LocalDateTime movementDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String description;
}
