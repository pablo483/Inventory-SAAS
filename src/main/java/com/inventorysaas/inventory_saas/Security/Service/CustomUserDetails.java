package com.inventorysaas.inventory_saas.Security.Service;

import com.inventorysaas.inventory_saas.Entity.User;
import com.inventorysaas.inventory_saas.Enum.Role;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@AllArgsConstructor
@Getter
public class CustomUserDetails implements UserDetails {//it's a data not service it cannot be autowired cause it isn't fixed every login have different dat of different user

    private Long id;
    private String tenantId;
    private String username;
    private String password;
    private String email;
    private Role role;
    private Boolean isActive;
    private SubscriptionPlan subscriptionPlan;


    //Factory method to create from user Entity
    public static CustomUserDetails build(User user) {

        String tenantId = (user.getTenant() != null)
                ? user.getTenant().getTenantId()
                : null;

        SubscriptionPlan subscriptionPlan = (user.getTenant() != null) ? user.getTenant().getSubscriptionPlan() : null;

        return new CustomUserDetails(
                user.getId(),
                tenantId,
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                subscriptionPlan
        );
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

}
