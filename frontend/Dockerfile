# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests and install them cleanly
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build the project
COPY . .

# API URL is baked in at build time by Vite
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx config (SPA fallback + gzip + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]