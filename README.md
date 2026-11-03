# Multi-Tenant Inventory SaaS

A production-style, multi-tenant **Software as a Service (SaaS)** inventory management platform built with a **Java 17 / Spring Boot 3.5** backend and a **React 19 / TypeScript** frontend.

## Architecture & Engineering Highlights

- **Multi-Tenant Isolation:** Tenant-aware request lifecycle (`TenantInterceptor`, `TenantContextHolder`, custom `TenantIsolationException`) isolating organizations, users, subscription plans, and inventory data.
- **Inventory & Stock Reconciliation Engine:** Full product, category, and supplier management with stock-in, stock-out, stock transfers, CSV exports (`OpenCSV`), and reconciliation reporting (`StockReconciliationService`).
- **Redis Caching, Pub/Sub & Leaderboards:**
  - Dedicated Redis caching layers for products, categories, suppliers, and tenants (`Jedis` pool).
  - Event-driven inventory updates via `InventoryEventPublisher` / `InventoryEventListener`.
  - Real-time tenant & product leaderboards powered by Redis sorted sets (`LeaderBoardService`).
- **API Rate Limiting & Security Hardening:**
  - Token-bucket rate limiting via **Bucket4j** (`RateLimitFilter`).
  - Stateless **Spring Security + JWT** authentication, security headers (`SecurityHeadersConfig`), and distributed request tracing (`CorrelationIdFilter` + `RequestLoggingFilter` injecting `correlationId` and `tenantId` into MDC logs).
- **Database Migrations & Connection Pooling:** Versioned schema migrations with **Flyway** (`V1__init_schema.sql`) and tuned **HikariCP** pools for high concurrency.
- **Production Containerization & Load Testing:**
  - Multi-container `docker-compose.prod.yml` running **Nginx** load-balancing across **3 Spring Boot instances (`app1`, `app2`, `app3`)** backed by **MySQL 8.0** and **Redis 7** (AOF persistence).
  - Observability via **Spring Boot Actuator** + **Micrometer Prometheus** (`/actuator/prometheus`) and load testing scripts in **Grafana k6** (`k6-load-test.js`).

## Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.5** (`Spring Web`, `Spring Data JPA`, `Spring Security`, `Spring AOP`, `Spring Retry`)
- **MySQL 8.0** & **Flyway** (Schema Migrations)
- **Redis 7** (`Spring Data Redis` + `Jedis` for Caching, Pub/Sub & Leaderboards)
- **Bucket4j** (Rate Limiting), **JJWT** (`0.12.3`), **OpenCSV**
- **Micrometer & Prometheus** (Metrics)

### Frontend (`frontend/`)
- **React 19**, **TypeScript**, **Vite**
- **Tailwind CSS**, **shadcn/ui** & **Radix UI**
- **TanStack React Query**, **React Hook Form** + **Zod**, **Recharts**

### DevOps & Testing
- **Docker**, **Docker Compose**, **Nginx** (Reverse Proxy & Load Balancer)
- **Grafana k6** (API Load Testing), **JUnit 5 & Mockito**

## Getting Started (Local Development)

### Prerequisites
- **Java 17 (JDK)**
- **Node.js 18+**
- **Docker & Docker Compose**

### 1. Clone the repository
```bash
git clone https://github.com/pablo483/Inventory-SAAS.git
cd Inventory-SAAS
```

### 2. Start MySQL & Redis via Docker Compose
```bash
docker compose up -d mysql redis
```

### 3. Run the Spring Boot Backend
```bash
./mvnw spring-boot:run
```
*Starts on `http://localhost:8080` (`dev` profile active by default).*

### 4. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Starts on `http://localhost:5173`.*

## Production Stack (Nginx + 3 App Replicas + MySQL + Redis)

1. Provide production environment variables (`DB_ROOT_PASSWORD`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`) in `.env.prod`.
2. Launch the full horizontally scaled stack:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
   ```
   See [DOCKER_EXPLANATION.md](DOCKER_EXPLANATION.md) for a deep dive into the container networking, Nginx upstream routing, and volume architecture.

## Monitoring & Load Testing

- **Prometheus Metrics:** `GET /actuator/prometheus`
- **Health Probes:** `GET /actuator/health`
- **Run k6 Load Test:**
  ```bash
  k6 run k6-load-test.js
  ```

## License & Author

MIT License • Built by **Sudarshan GC** ([GitHub](https://github.com/pablo483) • [sudarshangc580@gmail.com](mailto:sudarshangc580@gmail.com))
