package bwc.apiBWC.config;

import bwc.apiBWC.entities.Branch;
import bwc.apiBWC.entities.Role;
import bwc.apiBWC.entities.User;
import bwc.apiBWC.repositories.BranchRepository;
import bwc.apiBWC.repositories.RoleRepository;
import bwc.apiBWC.repositories.UserRepository;
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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create roles if they don't exist
        if (roleRepository.findByName("ROLE_ADMINISTRADOR").isEmpty()) {
            Role adminRole = new Role(null, "ROLE_ADMINISTRADOR");
            roleRepository.save(adminRole);
        }
        if (roleRepository.findByName("ROLE_VENDEDOR").isEmpty()) {
            Role userRole = new Role(null, "ROLE_VENDEDOR");
            roleRepository.save(userRole);
        }

        // Create branches if they don't exist
        if (branchRepository.count() == 0) {
            Branch branch1 = new Branch(null, "Sucursal Principal", "Calle Principal 123", "123456789");
            Branch branch2 = new Branch(null, "Sucursal Secundaria", "Calle Secundaria 456", "987654321");
            branchRepository.save(branch1);
            branchRepository.save(branch2);
        }

        // Create users if they don't exist
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
