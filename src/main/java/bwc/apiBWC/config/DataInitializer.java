package bwc.apiBWC.config;

import bwc.apiBWC.entities.*;
import bwc.apiBWC.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private MovementTypeRepository movementTypeRepository;

    @Autowired
    private DocumentStatusRepository documentStatusRepository;

    @Autowired
    private PaymentStatusRepository paymentStatusRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Inicializar Roles
        if (roleRepository.findByName("ROLE_ADMINISTRADOR").isEmpty()) {
            Role adminRole = new Role(null, "ROLE_ADMINISTRADOR");
            roleRepository.save(adminRole);
        }
        if (roleRepository.findByName("ROLE_VENDEDOR").isEmpty()) {
            Role userRole = new Role(null, "ROLE_VENDEDOR");
            roleRepository.save(userRole);
        }
        if (roleRepository.findByName("ROLE_ALMACENISTA").isEmpty()) {
            Role almacenistaRole = new Role(null, "ROLE_ALMACENISTA");
            roleRepository.save(almacenistaRole);
        }

        // Inicializar Sucursales
        if (branchRepository.count() == 0) {
            Branch branch1 = new Branch(null, "Sucursal Principal", "Calle Principal 123", "123456789", true);
            Branch branch2 = new Branch(null, "Sucursal Secundaria", "Calle Secundaria 456", "987654321", true);
            branchRepository.save(branch1);
            branchRepository.save(branch2);
        }

        // Inicializar Marcas
        if (brandRepository.count() == 0) {
            brandRepository.save(new Brand(null, "Nike"));
            brandRepository.save(new Brand(null, "Adidas"));
            brandRepository.save(new Brand(null, "Puma"));
            brandRepository.save(new Brand(null, "Reebok"));
            brandRepository.save(new Brand(null, "Converse"));
        }

        // Inicializar Categorías
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category(null, "Deportivo"));
            categoryRepository.save(new Category(null, "Casual"));
            categoryRepository.save(new Category(null, "Formal"));
            categoryRepository.save(new Category(null, "Infantil"));
        }

        // Inicializar Tallas
        if (sizeRepository.count() == 0) {
            for (int i = 20; i <= 45; i++) {
                sizeRepository.save(new Size(null, String.valueOf(i)));
            }
        }

        // ✅ CORREGIDO: Inicializar Tipos de Movimiento (SIN forzar IDs)
        if (movementTypeRepository.count() == 0) {
            movementTypeRepository.save(new MovementType(null, "ENTRADA"));
            movementTypeRepository.save(new MovementType(null, "SALIDA"));
            movementTypeRepository.save(new MovementType(null, "AJUSTE_POSITIVO"));
            movementTypeRepository.save(new MovementType(null, "AJUSTE_NEGATIVO"));
            movementTypeRepository.save(new MovementType(null, "TRANSFERENCIA_ENTRADA"));
            movementTypeRepository.save(new MovementType(null, "TRANSFERENCIA_SALIDA"));
        }

        // ✅ CORREGIDO: Inicializar Estados de Documento (SIN forzar IDs)
        if (documentStatusRepository.count() == 0) {
            documentStatusRepository.save(new DocumentStatus(null, "COMPLETADO"));
            documentStatusRepository.save(new DocumentStatus(null, "PENDIENTE"));
            documentStatusRepository.save(new DocumentStatus(null, "CANCELADO"));
        }

        // ✅ CORREGIDO: Inicializar Estados de Pago (SIN forzar IDs)
        if (paymentStatusRepository.count() == 0) {
            paymentStatusRepository.save(new PaymentStatus(null, "PENDIENTE"));
            paymentStatusRepository.save(new PaymentStatus(null, "PAGADO"));
            paymentStatusRepository.save(new PaymentStatus(null, "PARCIAL"));
            paymentStatusRepository.save(new PaymentStatus(null, "VENCIDO"));
        }

        // ✅ CORREGIDO: Inicializar Métodos de Pago (SIN forzar IDs)
        if (paymentMethodRepository.count() == 0) {
            paymentMethodRepository.save(new PaymentMethod(null, "EFECTIVO"));
            paymentMethodRepository.save(new PaymentMethod(null, "TARJETA"));
            paymentMethodRepository.save(new PaymentMethod(null, "TRANSFERENCIA"));
            paymentMethodRepository.save(new PaymentMethod(null, "CHEQUE"));
        }

        // Inicializar Cliente General
        if (customerRepository.count() == 0) {
            Customer generalCustomer = new Customer();
            generalCustomer.setFirstName("Cliente");
            generalCustomer.setLastName("General");
            generalCustomer.setEmail("general@zapateria.com");
            generalCustomer.setPhone("0000-0000");
            generalCustomer.setAddress("N/A");
            customerRepository.save(generalCustomer);
        }

        // Inicializar Usuario Administrador
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(roleRepository.findByName("ROLE_ADMINISTRADOR").get());
            admin.setRoles(adminRoles);
            Set<Branch> adminBranches = new HashSet<>();
            adminBranches.add(branchRepository.findAll().get(0));
            admin.setBranches(adminBranches);
            userRepository.save(admin);
        }

        // Inicializar Usuario Vendedor
        if (userRepository.findByUsername("vendedor").isEmpty()) {
            User user = new User();
            user.setUsername("vendedor");
            user.setPassword(passwordEncoder.encode("vendedor123"));
            Set<Role> userRoles = new HashSet<>();
            userRoles.add(roleRepository.findByName("ROLE_VENDEDOR").get());
            user.setRoles(userRoles);
            Set<Branch> userBranches = new HashSet<>();
            userBranches.add(branchRepository.findAll().get(0));
            userBranches.add(branchRepository.findAll().get(1));
            user.setBranches(userBranches);
            userRepository.save(user);
        }
    }
}