# Multi-Tenant Inventory SaaS

A production-ready, multi-tenant Software as a Service (SaaS) application for inventory management. Built with a robust Spring Boot backend and a modern React/Vite frontend.

## Features

- **Multi-Tenancy**: Secure data isolation between different tenants/organizations.
- **Authentication & Security**: JWT-based authentication with Spring Security.
- **Inventory Management**: Track products, categories, suppliers, and stock transactions.
- **Rate Limiting**: API rate limiting using Bucket4j and Redis.
- **Modern Frontend**: Fast, responsive UI built with React 19, Tailwind CSS, and shadcn/ui components.
- **Caching**: High-performance caching with Redis.
- **Database Migrations**: Version-controlled database schema using Flyway.
- **Monitoring & Observability**: Spring Boot Actuator integrated with Prometheus for metrics collection.
- **Performance Testing**: Includes k6 scripts for load testing API endpoints.

## Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.5.x**
- **Spring Data JPA** & **Hibernate**
- **MySQL** (Relational Database)
- **Redis** (Caching & Rate Limiting via Jedis)
- **Flyway** (Database Migrations)
- **Spring Security** & **JJWT**
- **Bucket4j** (Rate Limiting)
- **OpenCSV** (Data Export/Import)
- **Micrometer & Prometheus** (Metrics)

### Frontend
- **React 19** & **Vite**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** & **Radix UI**
- **React Query (@tanstack/react-query)**
- **React Hook Form** + **Zod** (Form validation)
- **Recharts** (Data visualization)
- **Axios** (HTTP client)

### DevOps & Infrastructure
- **Docker** & **Docker Compose**
- **Nginx** (Reverse Proxy)
- **k6** (Load testing)

## Prerequisites

Make sure you have the following installed on your machine:
- Java 17 (JDK)
- Node.js (v18+)
- Maven (or use the included `mvnw` wrapper)
- Docker & Docker Compose (for databases and Redis)
- MySQL (if running locally without Docker)

## 🛠️ Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd inventory-saas
```

### 2. Infrastructure setup
Start the required infrastructure (MySQL and Redis) using Docker Compose:
```bash
docker-compose up -d
```

### 3. Backend Setup
Configure your environment variables in `.env` (copy from a template if available), or verify that the default local credentials in `application-dev.yml` match your local setup.

Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```
*The backend will typically start on port 8080. Flyway will automatically run database migrations on startup.*

### 4. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will typically start on port 5173.*

## Docker & Production Deployment

The project is fully containerized for production deployment.

1. Ensure your `.env.prod` file is configured correctly with production credentials.
2. Build and start the production stack:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
*This will spin up the Backend API, Nginx frontend server, MySQL, and Redis.*

## Monitoring & Load Testing

- **Metrics**: Available at `/actuator/prometheus` (configurable via application properties).
- **Load Testing**: A load testing script is provided in `k6-load-test.js`. 
  To run it:
  ```bash
  k6 run k6-load-test.js
  ```

## Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

##  License
This project is proprietary and confidential unless otherwise specified.
