package com.inventorysaas.inventory_saas.Security.Config;


import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Actuator configuration for production monitoring
 *
 */
@Configuration
public class ActuatorConfig {

    /**
     * Use to check the server version
     * when user hit the api/actuator endpoint in response this json data will be shown
     */
    @Bean
    public InfoContributor infoContributor() {
        return builder -> {
            Map<String, Object> details = new HashMap<>();

            details.put("application", "inventory-saas");
            details.put("version", "1.0.0");
            details.put("startTime", LocalDateTime.now());
            details.put("spring.profile.active", "dev");

            builder.withDetail("custom", details);
        };
    }
}
