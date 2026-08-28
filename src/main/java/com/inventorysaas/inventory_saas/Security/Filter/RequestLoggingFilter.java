package com.inventorysaas.inventory_saas.Security.Filter;

import com.inventorysaas.inventory_saas.Tenant.Context.TenantContextHolder;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Filter to log http request & response
 * (2) Runs after CorrelationIdFilter
 */
@Slf4j
@Component
@Order(2)
public class RequestLoggingFilter implements Filter {

    private static final int MAX_PAYLOAD_LENGTH = 1000;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        //Skip logging for actuator endpoint
        if (httpRequest.getRequestURI().equals("/actuator")) {
            chain.doFilter(request, response);
            return;
        }

        //wrap request and response into cache content because body is in InputStream and it can only be read once
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);

        long startTime = System.currentTimeMillis();

        try {
            //log request
            logRequest(wrappedRequest);

            //process request
            chain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            //log response
            logResponse(wrappedResponse, duration);
            /**
             *  Copy response body to original response because when response is written by controller
             * it already went to cache memory so now the response is empty so we have to fill that servlet response with stored response in wrapped response class
             */
            wrappedResponse.copyBodyToResponse();

        }
    }

    public void logRequest(ContentCachingRequestWrapper wrappedRequest) {

        String method = wrappedRequest.getMethod();
        String uri = wrappedRequest.getRequestURI();
        String queryString = wrappedRequest.getQueryString();
        //get Client Ip
        String ip = getClientIp(wrappedRequest);


        //FOe testing only
        String localName = wrappedRequest.getLocalName();
        String localAddr = wrappedRequest.getLocalAddr();
        int localPort = wrappedRequest.getLocalPort();
        String remoteUser = wrappedRequest.getRemoteUser();
        int remotePort = wrappedRequest.getRemotePort();
        String remoteHost = wrappedRequest.getRemoteHost();
        StringBuilder logTest = new StringBuilder();
        logTest.append("Local Name :").append(localName)
                .append("Local Address :").append(localAddr)
                .append("Local Port :").append(localPort)
                .append("Remote User :").append(remoteUser)
                .append("Renote Port :").append(remotePort)
                .append("Remote Host : ").append(remoteHost);
        //for testing purpose only
        log.info(logTest.toString());

        StringBuilder logMessage = new StringBuilder();
        logMessage.append("Http Request: ")
                .append(method)
                .append(" ")
                .append(uri);
        if (queryString != null) {
            logMessage.append("?").append(queryString);
        }

        logMessage.append("from")
                .append(ip);

        //add tenant into mdc if present
        String tenantId = wrappedRequest.getHeader("X-Tenant-ID");
        if (tenantId != null) {
            MDC.put("tenantId", tenantId);
        } else {
            tenantId = TenantContextHolder.getCurrentTenantId();
            if (tenantId != null) {
                MDC.put("tenantId", tenantId);
            }
        }
        log.info(logMessage.toString());

        //Log request for POST/PUT (excluding sensitive endpoints)
        if (shouldLogBody(wrappedRequest)) {
            String body = getRequestBody(wrappedRequest);
            if (body != null && !body.isEmpty()) {
                log.debug("Request Body :{}", truncateBody(body));
            }
        }

    }


    private void logResponse(ContentCachingResponseWrapper response, Long duration) {
        int status = response.getStatus();
        String logLevel = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";

        String logMessage = String.format("Http Response %d in %dms ", status, duration);

        switch (logLevel) {
            case "ERROR" -> log.error(logMessage);
            case "WARN" -> log.warn(logMessage);
            default -> log.info(logMessage);
        }

        //log response body on error
        if (status >= 400) {
            String body = getResponseBody(response);
            if (body != null && !body.isEmpty()) {
                log.error("Response Body :{}", truncateBody(body));
            }
        }

    }

    private String getResponseBody(ContentCachingResponseWrapper response) {
        byte[] content = response.getContentAsByteArray();
        if (content.length > 0) {
            return new String(content, StandardCharsets.UTF_8);
        }
        return null;
    }


    private String truncateBody(String msg) {
        if (msg.length() > MAX_PAYLOAD_LENGTH) {
            return msg.substring(0, MAX_PAYLOAD_LENGTH) + ".......truncated";
        }
        return msg;
    }

    private String getRequestBody(ContentCachingRequestWrapper request) {
        byte[] content = request.getContentAsByteArray();

        if (content.length > 0) {
            return new String(content, StandardCharsets.UTF_8);
        }
        return null;
    }


    private Boolean shouldLogBody(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        //Don't log body for auth endpoints (contains password)
        if (uri.equals("/auth")) {
            return false;
        }
        return "POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");//ip from nginx,aws cloudFront or CloudFlare
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");//another header set by api getWay & proxies
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();//gets the direct network ip of the caller

        }
        return ip;
    }
}
