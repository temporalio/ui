# Docker Build Guide for Temporal UI

This guide explains how to build and use the Temporal UI Docker image with authorization features.

## 🔨 Building the Docker Image

### Quick Start

```bash
# Build with default settings
./server/docker-build.sh

# Build with custom tag
./server/docker-build.sh --tag v1.0.0

# Build with custom image name
./server/docker-build.sh --name my-temporal-ui --tag latest
```

### Build Script Options

The `docker-build.sh` script supports the following options:

- `--tag TAG` - Set the image tag (default: `latest`)
- `--name NAME` - Set the image name (default: `temporal-ui-auth`)
- `--help` - Show help message

### Build Process

The build script performs the following steps:

1. **Validates** the Dockerfile exists
2. **Builds** the Docker image using multi-stage build:
   - **Frontend Stage**: Builds the SvelteKit UI using Node.js and pnpm
   - **Backend Stage**: Compiles the Go server binary
   - **Final Stage**: Combines everything in a minimal Alpine image
3. **Displays** build information and usage instructions

## 🐳 Running the Docker Image

### Basic Usage

```bash
# Run with default configuration
docker run --rm -p 8088:8088 temporal-ui-auth:latest
```

### With Environment Variables

The Docker image supports extensive configuration through environment variables:

```bash
# Run with custom Temporal server
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=your-temporal-server:7233 \
  temporal-ui-auth:latest

# Run with authentication enabled
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=your-temporal-server:7233 \
  -e TEMPORAL_AUTH_ENABLED=true \
  -e TEMPORAL_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui \
  -e TEMPORAL_AUTH_CLIENT_ID=temporal-ui \
  -e TEMPORAL_AUTH_CLIENT_SECRET=your-secret \
  -e TEMPORAL_AUTH_CALLBACK_URL=http://localhost:8088/auth/sso/callback \
  temporal-ui-auth:latest
```

### Environment Variables

The image uses the `docker.yaml` configuration which supports templating. Available environment variables:

#### Core Configuration
- `TEMPORAL_ADDRESS` - Temporal server address
- `TEMPORAL_UI_PORT` - UI server port (default: 8080)
- `TEMPORAL_UI_ENABLED` - Enable UI (default: true)
- `TEMPORAL_DEFAULT_NAMESPACE` - Default namespace
- `TEMPORAL_SHOW_TEMPORAL_SYSTEM_NAMESPACE` - Show system namespace (default: false)
- `TEMPORAL_DISABLE_WRITE_ACTIONS` - Disable write operations (default: false)

#### Authentication
- `TEMPORAL_AUTH_ENABLED` - Enable authentication (default: false)
- `TEMPORAL_AUTH_TYPE` - Authentication type (default: oidc)
- `TEMPORAL_AUTH_PROVIDER_URL` - OIDC provider URL
- `TEMPORAL_AUTH_ISSUER_URL` - OIDC issuer URL
- `TEMPORAL_AUTH_CLIENT_ID` - OIDC client ID
- `TEMPORAL_AUTH_CLIENT_SECRET` - OIDC client secret
- `TEMPORAL_AUTH_CALLBACK_URL` - OAuth callback URL
- `TEMPORAL_AUTH_SCOPES` - Comma-separated list of OAuth scopes

#### CORS Configuration
- `TEMPORAL_CORS_ORIGINS` - Comma-separated list of allowed origins
- `TEMPORAL_CORS_UNSAFE_ALLOW_ALL_ORIGINS` - Allow all origins (default: false)
- `TEMPORAL_CSRF_COOKIE_INSECURE` - Allow insecure cookies (default: false)

#### TLS Configuration
- `TEMPORAL_TLS_CA` - Path to CA certificate
- `TEMPORAL_TLS_CERT` - Path to client certificate
- `TEMPORAL_TLS_KEY` - Path to client key
- `TEMPORAL_TLS_ENABLE_HOST_VERIFICATION` - Enable host verification (default: false)

#### Codec Configuration
- `TEMPORAL_CODEC_ENDPOINT` - Codec server endpoint
- `TEMPORAL_CODEC_PASS_ACCESS_TOKEN` - Pass access token to codec (default: false)
- `TEMPORAL_CODEC_INCLUDE_CREDENTIALS` - Include credentials (default: false)

#### Other Configuration
- `TEMPORAL_FORWARD_HEADERS` - Comma-separated list of headers to forward
- `TEMPORAL_HIDE_LOGS` - Hide logs in UI (default: false)

## 📝 Configuration File

The Docker image uses `server/config/docker.yaml` which has template support enabled. This allows for runtime configuration through environment variables.

### Template Syntax

The configuration uses Go template syntax:

```yaml
# enable-template
temporalGrpcAddress: {{ env "TEMPORAL_ADDRESS" | default "127.0.0.1:7233" }}
port: {{ env "TEMPORAL_UI_PORT" | default "8080" }}
```

## 🚀 Deployment Examples

### Docker Compose

```yaml
version: '3.8'
services:
  temporal-ui:
    image: temporal-ui-auth:latest
    ports:
      - '8088:8080'
    environment:
      - TEMPORAL_ADDRESS=temporal:7233
      - TEMPORAL_AUTH_ENABLED=true
      - TEMPORAL_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui
      - TEMPORAL_AUTH_CLIENT_ID=temporal-ui
      - TEMPORAL_AUTH_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
      - TEMPORAL_AUTH_CALLBACK_URL=http://localhost:8088/auth/sso/callback
      - TEMPORAL_AUTH_SCOPES=openid,profile,email
    restart: unless-stopped
    networks:
      - temporal-network

networks:
  temporal-network:
    driver: bridge
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: temporal-ui
  template:
    metadata:
      labels:
        app: temporal-ui
    spec:
      containers:
      - name: temporal-ui
        image: temporal-ui-auth:latest
        ports:
        - containerPort: 8080
        env:
        - name: TEMPORAL_ADDRESS
          value: "temporal-frontend:7233"
        - name: TEMPORAL_AUTH_ENABLED
          value: "true"
        - name: TEMPORAL_AUTH_PROVIDER_URL
          valueFrom:
            configMapKeyRef:
              name: temporal-ui-config
              key: auth-provider-url
        - name: TEMPORAL_AUTH_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: temporal-ui-secrets
              key: client-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔍 Troubleshooting

### Build Issues

```bash
# Check Docker is running
docker info

# Clean build cache
docker builder prune

# Build with no cache
docker build --no-cache -f Dockerfile -t temporal-ui-auth:latest .
```

### Runtime Issues

```bash
# Check container logs
docker logs <container-id>

# Run in interactive mode
docker run --rm -it temporal-ui-auth:latest /bin/sh

# Test with minimal configuration
docker run --rm -p 8088:8080 \
  -e TEMPORAL_ADDRESS=localhost:7233 \
  temporal-ui-auth:latest
```

### Configuration Issues

```bash
# Verify environment variables are being set
docker run --rm temporal-ui-auth:latest env | grep TEMPORAL

# Check the configuration being used
docker run --rm temporal-ui-auth:latest cat /app/config/docker.yaml
```

## 📚 Additional Resources

- [Docker Environment Variables Guide](../DOCKER_ENVIRONMENT_VARIABLES.md)
- [Docker Deployment Guide](../DOCKER_DEPLOYMENT.md)
- [Authorization Setup Guide](../TEMPORAL_UI_AUTHORIZATION_SETUP.md)

## 🎯 Best Practices

1. **Use specific tags** in production instead of `latest`
2. **Store secrets** in environment files or secret managers
3. **Enable health checks** for container orchestration
4. **Use multi-stage builds** to keep image size small
5. **Run as non-root user** (already configured in the image)
6. **Enable TLS** in production environments
7. **Configure proper CORS** origins for security
8. **Use resource limits** in production deployments

## 📊 Image Information

- **Base Image**: Alpine Linux (minimal footprint)
- **Size**: ~128MB
- **User**: Non-root user `temporal` (UID 1001)
- **Working Directory**: `/app`
- **Exposed Port**: 8088 (configurable via `TEMPORAL_UI_PORT`)
- **Health Check**: HTTP GET to `/health` endpoint

