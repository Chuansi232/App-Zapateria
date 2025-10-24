package bwc.apiBWC.services;

import bwc.apiBWC.dtos.request.SignUpRequest;
import bwc.apiBWC.entities.Branch;
import bwc.apiBWC.entities.Role;
import bwc.apiBWC.entities.User;
import bwc.apiBWC.exceptions.ResourceNotFoundException;
import bwc.apiBWC.repositories.BranchRepository;
import bwc.apiBWC.repositories.RoleRepository;
import bwc.apiBWC.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(SignUpRequest signUpRequest) {
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName("ROLE_VENDEDOR")
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_VENDEDOR"));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName("ROLE_ADMINISTRADOR")
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_ADMINISTRADOR"));
                        roles.add(adminRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName("ROLE_VENDEDOR")
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_VENDEDOR"));
                        roles.add(userRole);
                }
            });
        }
        user.setRoles(roles);

        Set<Long> strBranches = signUpRequest.getBranches();
        Set<Branch> branches = new HashSet<>();

        if (strBranches != null) {
            strBranches.forEach(branchId -> {
                Branch branch = branchRepository.findById(branchId)
                        .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
                branches.add(branch);
            });
        }
        user.setBranches(branches);

        return userRepository.save(user);
    }
}
