package com.inventorysaas.inventory_saas.Service;

import com.inventorysaas.inventory_saas.DTO.CreateUserRequest;
import com.inventorysaas.inventory_saas.DTO.UpdateUserRequest;
import com.inventorysaas.inventory_saas.DTO.UserResponse;
import com.inventorysaas.inventory_saas.DTO.PageResponse;
import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Exception.UserAlreadyExistException;
import com.inventorysaas.inventory_saas.Repository.UserRepository;
import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class TenantUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllTenantUsers(String searchTerm, Pageable pageable) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        
        Page<User> usersPage;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            usersPage = userRepository.searchUsersByTenantIdAndTerm(tenantId, searchTerm, pageable);
        } else {
            usersPage = userRepository.findByTenantId(tenantId, pageable);
        }

        return PageResponse.<UserResponse>builder()
                .content(usersPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .isFirst(usersPage.isFirst())
                .isLast(usersPage.isLast())
                .hasNext(usersPage.hasNext())
                .hasPrevious(usersPage.hasPrevious())
                .build();
    }

    @Transactional
    public UserResponse createTenantUser(CreateUserRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("Email already registered: " + request.getEmail());
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
                .role(request.getRole())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateTenantUser(Long userId, UpdateUserRequest request) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("You do not have permission to modify this user");
        }

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Transactional
    public void deleteTenantUser(Long userId) {
        String tenantId = TenantContextHolder.getCurrentTenantId();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("You do not have permission to delete this user");
        }

        userRepository.delete(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .tenantId(user.getTenantId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
