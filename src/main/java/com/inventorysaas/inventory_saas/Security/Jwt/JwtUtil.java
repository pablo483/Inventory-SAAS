package com.inventorysaas.inventory_saas.Security.Jwt;

import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Security.Service.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * JWT utility for token generation and validation
 * Embeds tenant_id in token claims for tenant isolation
 */

@Component
@RequiredArgsConstructor
public class JwtUtil {



    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private static final Logger logger =  LoggerFactory.getLogger(JwtUtil.class);

    public String generateToken(CustomUserDetails userDetails) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId());
        claims.put("tenantId", userDetails.getTenantId());
        claims.put("role", userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")));
        claims.put("subscriptionPlan",userDetails.getSubscriptionPlan());


        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSignKey())
                .compact();

    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    //validate token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()  //ready for read create verify
                    .verifyWith(getSignKey())//add key to check
                    .build()                 //parser is ready to check
                    .parseSignedClaims(token); //actually check ,validate ,and check expiration
            return true;
        } catch (Exception e) {
            logger.error("Jwt claims String is empty :{}", e.getMessage());
        }
        return false;

    }

    //extract username from token
    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    //extract userId from token
    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    //extract tenantId from token
    public String getTenantIdFromToken(String token) {
        return getClaims(token).get("tenantId", String.class);
    }

    //extract user roles from token
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    //extract subscription plan form token
    public SubscriptionPlan getSubscriptionPlanFromToken(String token){
        String planName = getClaims(token).get("subscriptionPlan", String.class);
        return planName!=null ? SubscriptionPlan.valueOf(planName):SubscriptionPlan.BASIC;
    }

}
