package com.inventorysaas.inventory_saas.monitoring;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AOP-based performance monitoring for service methods
 */
@Aspect
@Component
public class PerformanceMonitor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitor.class);

    private static final long SLOW_THRESHOLD_MS = 1000; // 1 second

    @Around("execution(* com.inventorysaas.service..*(..))")
    public Object monitorServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            if (duration > SLOW_THRESHOLD_MS) {
                logger.warn("SLOW SERVICE METHOD: {} took {}ms", methodName, duration);
            } else {
                logger.debug("Service method {} executed in {}ms", methodName, duration);
            }

            return result;
        } catch (Throwable e) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("Service method {} failed after {}ms: {}", methodName, duration, e.getMessage());
            throw e;
        }
    }
}
