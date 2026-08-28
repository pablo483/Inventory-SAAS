package com.inventorysaas.inventory_saas.Security.Config;

import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.List;

/**
 *  * Security headers configuration following OWASP recommendations
 */
@Configuration
public class SecurityHeadersConfig {

    //CORS Configuration for production
    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration=new CorsConfiguration();
        //Allow specific origin patterns (configure for your domain)
        configuration.setAllowedOriginPatterns(List.of(
            "http://yourDomain.com",
            "https://app.yourdomain.com",
            "http://localhost:*"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("X-Correlation-ID","X-Rate-Limit-Remaining"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**",configuration);
        return source;
    }
}
