package com.inventorysaas.inventory_saas.Exception;

/**
 * Thrown when rate limit is exceeded
 */
public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}
