# Multi-stage build for Temporal UI with Authorization
FROM node:20-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY svelte.config.js ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.cjs ./

# Copy scripts, plugins, and utilities needed for build
COPY scripts/ ./scripts/
COPY plugins/ ./plugins/
COPY utilities/ ./utilities/

# Install pnpm and dependencies (ignore scripts initially to avoid prepare hook)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --ignore-scripts

# Run the prepare script manually if needed
RUN pnpm run prepare || true

# Copy source code
COPY src/ ./src/
COPY static/ ./static/

# Build the frontend (use build:docker for production)
RUN pnpm run build:docker

# Go build stage
FROM golang:1.23-alpine AS go-builder

# Install build dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY server/go.mod server/go.sum ./

# Download dependencies
RUN go mod download

# Copy server source code
COPY server/ ./

# Copy the NEW frontend build from frontend-builder into the embedded assets directory
# This ensures the Go binary embeds the latest frontend with the polyfill
COPY --from=frontend-builder /app/build/ ./ui/assets/local/

# Build the server binary for Linux AMD64 (Kubernetes compatible)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o ui-server ./cmd/server

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1001 -S temporal && \
    adduser -u 1001 -S temporal -G temporal

# Set working directory
WORKDIR /app

# Copy server binary from builder
COPY --from=go-builder /app/ui-server .

# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/build ./build

# Copy configuration files
COPY server/config/ ./config/

# Copy Keycloak plugins (if needed for deployment)
COPY keycloak-plugins/ ./keycloak-plugins/

# Copy scripts
COPY scripts/ ./scripts/

# Set ownership
RUN chown -R temporal:temporal /app

# Switch to non-root user
USER temporal

# Expose port
EXPOSE 8088

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8088/health || exit 1

# Start the server with docker config (no TLS requirements, works in K8s)
CMD ["./ui-server", "--config", "./config", "--env", "docker", "start"]
