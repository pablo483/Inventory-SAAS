package com.inventorysaas.inventory_saas.Repository;

import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByTenantIdAndUsername(String tenantId,String username);

    Optional<User> findByEmail(String email);

    List<User> findByTenantId(String tenantId);         //doesn't need if used hibernate @Filter but better

    List<User> findByTenantIdAndRole(String tenantId,Role role);

    boolean existsByTenantId(String tenantId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByTenantIdAndRole(String tenantId, Role role);

    boolean existsByRole(Role role);

    boolean existsByTenantIdAndUsername(String tenantId,String username);

    Long countByTenantId(String tenantId);

    Page<User> findByTenantId(String tenantId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> searchUsersByTenantIdAndTerm(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm, Pageable pageable);
}
