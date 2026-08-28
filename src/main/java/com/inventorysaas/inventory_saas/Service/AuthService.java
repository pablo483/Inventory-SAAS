package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.LoginRequest;
import com.inventorysaas.inventory_saas.DTO.LoginResponse;
import com.inventorysaas.inventory_saas.DTO.RegisterRequest;
import com.inventorysaas.inventory_saas.DTO.RegisterResponse;
import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.Role;
import com.inventorysaas.inventory_saas.Exception.InvalidCredentialsException;
import com.inventorysaas.inventory_saas.Exception.UserAlreadyExistException;
import com.inventorysaas.inventory_saas.Repository.UserRepository;
import com.inventorysaas.inventory_saas.Security.Jwt.JwtUtil;
import com.inventorysaas.inventory_saas.Security.Service.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {

        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            if (request.getTenantId() != null && !request.getTenantId().equals(userDetails.getTenantId())) {
                throw new InvalidCredentialsException("user does not belong to tenant:{}" + request.getTenantId());
            }

            String jwt = jwtUtil.generateToken(userDetails);

            return LoginResponse.builder()
                    .token(jwt)
                    .userId(userDetails.getTenantId())
                    .username(userDetails.getUsername())
                    .email(userDetails.getEmail())
                    .tenantId(userDetails.getTenantId())
                    .role(userDetails.getRole().name())
                    .build();

        } catch (AuthenticationException e) {
            log.error("Authentication failed for email:{}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or username");
        }
    }

    // register tenant admin
    @Transactional
    public RegisterResponse registerTenantAdmin(String tenantId, RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("Email already registered" + request.getEmail());
        }

        if (userRepository.existsByTenantIdAndUsername(tenantId, request.getUsername())) {
            throw new UserAlreadyExistException("Username already exists in this tenant");
        }

        User user = User.builder()
                .email(request.getEmail())
                .tenantId(tenantId)
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .role(Role.TENANT_ADMIN)
                .phone(request.getPhone())
                .build();
        User saved = userRepository.save(user);

        return RegisterResponse.builder()
                .tenantId(saved.getTenantId())
                .email(saved.getEmail())
                .username(saved.getUsername())
                .userId(saved.getId())
                .role(saved.getRole().name())
                .message("user is registered successfully as tenant admin")
                .build();

    }

    @Transactional
    public RegisterResponse registerTenantUser(String tenantId, RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("Email already registered" + request.getEmail());
        }

        if (userRepository.existsByTenantIdAndUsername(tenantId, request.getUsername())) {
            throw new UserAlreadyExistException("Username already exists in this tenant");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .tenantId(tenantId)
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.TENANT_USER)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        return RegisterResponse.builder()
                .userId(saved.getId())
                .email(saved.getEmail())
                .tenantId(saved.getTenantId())
                .username(saved.getUsername())
                .role(saved.getRole().name())
                .message("User us registered successfully as tenant user")
                .build();
    }

    // for demo only
    @Transactional
    public RegisterResponse registerTenantSuperAdmin(RegisterRequest request) {

        if (userRepository.existsByRole(Role.SUPER_ADMIN)) {
            throw new UserAlreadyExistException("A Super Admin already exists in the system.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("Email already registered" + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .tenantId(null)
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.SUPER_ADMIN)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        return RegisterResponse.builder()
                .userId(saved.getId())
                .email(saved.getEmail())
                .tenantId(saved.getTenantId())
                .username(saved.getUsername())
                .role(saved.getRole().name())
                .message("User is registered successfully as GOD")
                .build();
    }
}
