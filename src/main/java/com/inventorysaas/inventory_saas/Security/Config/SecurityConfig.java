package com.inventorysaas.inventory_saas.Security.Config;

import com.inventorysaas.inventory_saas.Security.Filter.JwtAuthenticationEntryPoint;
import com.inventorysaas.inventory_saas.Security.Filter.JwtAuthenticationFilter;
import com.inventorysaas.inventory_saas.Security.Service.UserDetailServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Spring Security Configuration
 * - Stateless JWT authentication
 * - BCrypt password encoding
 * - Role-based authorization
 * - Public endpoints for auth
 */

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

        private final UserDetailServiceImpl userDetailService;

        private final JwtAuthenticationEntryPoint authenticationEntryPoint;

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        private final SecurityHeadersConfig securityHeadersConfig;

        // BCryptEncoder with strength 12
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
        }

        // DaoAuthenticationProvider
        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        // Authentication Manager
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfiguration)
                        throws Exception {
                return authConfiguration.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // 1. Disable CSRF for stateless REST API
                                .csrf(csrf -> csrf.disable())

                                // 2. Enable CORS using corsConfigurationSource() Bean from
                                // SecurityHeadersConfig
                                .cors(cors -> cors.configurationSource(securityHeadersConfig.corsConfigurationSource()))

                                // 3. Security HTTP Response Headers (CSP, Frame Options, XSS, etc.)
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp
                                                                .policyDirectives(
                                                                                "default-src 'self'; frame-ancestors 'none'; form-action 'self'"))
                                                .frameOptions(frame -> frame.deny())
                                                .xssProtection(xss -> xss.headerValue(
                                                                XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                // .contentTypeOptions(contentType -> contentType.disable()) // Enforces
                                                // X-Content-Type-Options: nosniff (by default its enables if we disable
                                                // it the protection is off)
                                                .referrerPolicy(referrer -> referrer
                                                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                                                .permissionsPolicyHeader(permissions -> permissions
                                                                .policy("geolocation=(), microphone=(), camera=()")))

                                // 4. Exception Handling
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(authenticationEntryPoint))

                                // 5. Session Management (Stateless JWT)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // 6. Endpoint Authorization Rules
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers("/api/auth/**", "/error").permitAll()
                                                .requestMatchers("/actuator/health/**").permitAll()

                                                // Secured endpoints (Specific roles)
                                                .requestMatchers("/api/super-admin/**").hasRole("SUPER_ADMIN")
                                                .requestMatchers("/api/tenant-admin/**").hasRole("TENANT_ADMIN")

                                                // Everything else requires authentication
                                                .anyRequest().authenticated());

                // 7. Authentication Provider & Custom Filters
                http.authenticationProvider(authenticationProvider());
                http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

}
