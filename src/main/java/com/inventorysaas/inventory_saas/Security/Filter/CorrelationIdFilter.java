package com.inventorysaas.inventory_saas.Security.Filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;


/**
 * Filter to generate and propagate correlation id for request tracing
 * order 1 -run first this filter before any other filter
 */
@Component
@Order(1)
public class CorrelationIdFilter implements Filter {


    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        //This casting will allow method like get set header function for http request
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        try {
            //generate correlation id
            String correlationId = httpRequest.getHeader(CORRELATION_ID_HEADER);
            if (correlationId != null && !correlationId.isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }
            //Store in MDC for logging liek itll add this kid whenever the logging is performed
            MDC.put(CORRELATION_ID_MDC_KEY, correlationId);

            //add to response header
            httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);

            //noe after this filter send this request adn response to another filter or if there isnt then to controller
            chain.doFilter(request, response);
        } catch (Exception e) {
            //Clear id  from MDC after request is done
            MDC.clear();
        }
    }
}
