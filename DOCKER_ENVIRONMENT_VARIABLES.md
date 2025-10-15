# Docker Environment Variables Guide

This guide explains how to use the Temporal UI Docker image with different configurations.

## 🐳 Quick Start

### Basic Usage

```bash
# Run with default configuration
docker run --rm -p 8088:8088 temporal-ui-auth:latest

# Run with custom Temporal server
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=your-temporal-server:7233 \
  temporal-ui-auth:latest
```

## 🔧 Configuration Options

The Docker image supports several configuration approaches:

### 1. Using Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  temporal-ui:
    image: temporal-ui-auth:latest
    ports:
      - '8088:8088'
    environment:
      - TEMPORAL_ADDRESS=your-temporal-server:7233
      - TEMPORAL_UI_PORT=8088
      - TEMPORAL_UI_AUTH_ENABLED=false
    restart: unless-stopped
```

### 2. Using Environment Variables

The Docker image supports these environment variables:

#### Core Configuration

- `TEMPORAL_ADDRESS` - Temporal server address (default: `temporal:7233`)
- `TEMPORAL_UI_PORT` - UI server port (default: `8088`)

#### Authentication

- `TEMPORAL_UI_AUTH_ENABLED` - Enable authentication (default: `false`)
- `TEMPORAL_UI_AUTH_PROVIDER_URL` - OIDC provider URL
- `TEMPORAL_UI_AUTH_CLIENT_ID` - OIDC client ID
- `TEMPORAL_UI_AUTH_CLIENT_SECRET` - OIDC client secret
- `TEMPORAL_UI_AUTH_CALLBACK_URL` - OIDC callback URL
- `TEMPORAL_UI_AUTH_JWT_SECRET` - JWT secret for token validation

#### CORS Configuration

- `TEMPORAL_UI_CORS_ORIGIN_1` - First allowed origin
- `TEMPORAL_UI_CORS_ORIGIN_2` - Second allowed origin
- `TEMPORAL_UI_CORS_ORIGIN_3` - Third allowed origin
- `TEMPORAL_UI_CORS_INSECURE` - Allow insecure cookies (default: `true`)

#### Codec Configuration

- `TEMPORAL_UI_CODEC_ENDPOINT` - Codec server endpoint (optional)

## 📋 Usage Examples

### Example 1: Basic Setup

```bash
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  temporal-ui-auth:latest
```

### Example 2: With Authentication

```bash
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_SECRET=your-secret \
  temporal-ui-auth:latest
```

### Example 3: Production Setup

```bash
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=production-temporal:7233 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=https://auth.company.com/realms/temporal \
  -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui-prod \
  -e TEMPORAL_UI_AUTH_CLIENT_SECRET=super-secret-key \
  -e TEMPORAL_UI_CORS_ORIGIN_1=https://temporal.company.com \
  -e TEMPORAL_UI_CORS_INSECURE=false \
  temporal-ui-auth:latest
```

### Example 4: With Custom CORS

```bash
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  -e TEMPORAL_UI_CORS_ORIGIN_1=https://myapp.example.com \
  -e TEMPORAL_UI_CORS_ORIGIN_2=https://admin.example.com \
  -e TEMPORAL_UI_CORS_INSECURE=false \
  temporal-ui-auth:latest
```

## 🚀 Docker Compose Examples

### Complete Setup with Keycloak

```yaml
version: '3.8'
services:
  temporal-ui:
    image: temporal-ui-auth:latest
    ports:
      - '8088:8088'
    environment:
      - TEMPORAL_ADDRESS=temporal:7233
      - TEMPORAL_UI_PORT=8088
      - TEMPORAL_UI_AUTH_ENABLED=true
      - TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui
      - TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui
      - TEMPORAL_UI_AUTH_CLIENT_SECRET=your-jwt-secret-key-for-temporal-ui
      - TEMPORAL_UI_AUTH_CALLBACK_URL=http://localhost:8088/auth/sso/callback
      - TEMPORAL_UI_AUTH_JWT_SECRET=your-jwt-secret-key-for-temporal-ui
    depends_on:
      - keycloak
    networks:
      - temporal-network

  keycloak:
    image: quay.io/keycloak/keycloak:26.4.0
    ports:
      - '8080:8080'
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    command: ['start-dev']
    networks:
      - temporal-network

networks:
  temporal-network:
    driver: bridge
```

## 🔍 Troubleshooting

### Container Not Starting

```bash
# Check container logs
docker logs <container-id>

# Run in foreground to see errors
docker run --rm -it temporal-ui-auth:latest
```

### Configuration Issues

```bash
# Test with minimal configuration
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=localhost:7233 \
  temporal-ui-auth:latest
```

### Health Check

```bash
# Check if container is healthy
curl http://localhost:8088/health

# Check container status
docker ps
```

## 📚 Additional Resources

- [Docker Deployment Guide](DOCKER_DEPLOYMENT.md)
- [Authorization Setup](TEMPORAL_UI_AUTHORIZATION_SETUP.md)
- [Keycloak Commands](KEYCLOAK_COMMANDS_REFERENCE.md)

## 🎯 Best Practices

1. **Use Docker Compose** for complex setups
2. **Set environment variables** in `.env` files
3. **Use secrets management** for production
4. **Enable health checks** for monitoring
5. **Use specific image tags** in production

## 🔒 Security Considerations

- Use HTTPS in production
- Set secure JWT secrets
- Configure proper CORS origins
- Use secrets management for sensitive data
- Enable TLS verification in production
