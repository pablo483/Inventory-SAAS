# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy dependencies first (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install dumb-init and create user
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Create directories
RUN mkdir -p /var/log/inventory-saas && \
    chown -R appuser:appuser /var/log/inventory-saas /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health/liveness || exit 1

# Production JVM flags
ENV JAVA_OPTS="\
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseSerialGC \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:+ParallelRefProcEnabled \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/var/log/inventory-saas/heap-dump.hprof \
    -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]