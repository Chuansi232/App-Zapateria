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
        // Create roles
        Role adminRole = new Role(null, "ROLE_ADMINISTRADOR");
        Role userRole = new Role(null, "ROLE_VENDEDOR");
        roleRepository.save(adminRole);
        roleRepository.save(userRole);

        // Create branches
        Branch branch1 = new Branch(null, "Sucursal Principal", "Calle Principal 123", "123456789");
        Branch branch2 = new Branch(null, "Sucursal Secundaria", "Calle Secundaria 456", "987654321");
        branchRepository.save(branch1);
        branchRepository.save(branch2);

        // Create users
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);
        admin.setRoles(adminRoles);
        Set<Branch> adminBranches = new HashSet<>();
        adminBranches.add(branch1);
        admin.setBranches(adminBranches);
        userRepository.save(admin);

        User user = new User();
        user.setUsername("vendedor");
        user.setPassword(passwordEncoder.encode("vendedor123"));
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(userRole);
        user.setRoles(userRoles);
        Set<Branch> userBranches = new HashSet<>();
        userBranches.add(branch1);
        userBranches.add(branch2);
        user.setBranches(userBranches);
        userRepository.save(user);
    }
}
