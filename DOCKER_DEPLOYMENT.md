# Docker Deployment Guide for Temporal UI with Authorization

This guide explains how to deploy the Temporal UI with granular authorization using Docker.

## 🐳 Quick Start

### Option 1: Complete Setup (Recommended)

```bash
# Run the complete setup script
./scripts/docker-setup.sh
```

### Option 2: Manual Setup

```bash
# Build the Docker image (Linux-compatible)
./scripts/docker-build-linux.sh

# Start all services
docker-compose up -d

# Setup Keycloak (after Keycloak is ready)
./scripts/setup-keycloak-simple.sh
./scripts/manage-temporal-users.sh
```

### Option 3: Multi-Architecture Build

```bash
# Build for multiple architectures
./scripts/docker-build-multiarch.sh

# Or build for specific platforms
./scripts/docker-build-multiarch.sh --platforms linux/amd64,linux/arm64
```

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- Ports 8080, 8088 available

## 🏗️ Architecture

The Docker setup includes:

- **Temporal UI** - Frontend and backend with authorization
- **Keycloak** - Identity and access management

## 🔧 Environment Variables

The Docker image supports extensive environment variable configuration:

### Core Configuration

```bash
TEMPORAL_ADDRESS=your-temporal-server:7233  # Temporal server address
TEMPORAL_UI_PORT=8088                       # UI server port
```

### Authentication

```bash
TEMPORAL_UI_AUTH_ENABLED=true                                    # Enable authentication
TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui
TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui
TEMPORAL_UI_AUTH_CLIENT_SECRET=your-secret
TEMPORAL_UI_AUTH_CALLBACK_URL=http://localhost:8088/auth/sso/callback
TEMPORAL_UI_AUTH_JWT_SECRET=your-jwt-secret
```

### CORS Configuration

```bash
TEMPORAL_UI_CORS_ORIGIN_1=https://myapp.example.com
TEMPORAL_UI_CORS_ORIGIN_2=https://admin.example.com
TEMPORAL_UI_CORS_INSECURE=false
```

### Example Usage

```bash
# Basic run
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  temporal-ui-auth:latest

# With authentication
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui \
  temporal-ui-auth:latest
```

- **PostgreSQL** - Database for Temporal (optional)
- **Temporal Server** - Workflow engine (optional)

## 🔧 Configuration

### Environment Variables

Create a `.env` file for production:

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=temporal:7233
TEMPORAL_UI_PORT=8088

# Authentication
TEMPORAL_UI_AUTH_ENABLED=true
KEYCLOAK_URL=http://keycloak:8080/realms/temporal-ui
KEYCLOAK_CLIENT_ID=temporal-ui
KEYCLOAK_CLIENT_SECRET=your-jwt-secret-key-for-temporal-ui
CALLBACK_URL=http://localhost:8088/auth/sso/callback
JWT_SECRET=your-jwt-secret-key-for-temporal-ui

# Keycloak Admin
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin@123
```

### Production Configuration

For production, use `docker-compose.prod.yml`:

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment Options

### 1. Development Mode

```bash
# Quick start with all services
docker-compose up -d

# Access the UI
open http://localhost:8088
```

### 2. Production Mode

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# With environment file
docker-compose -f docker-compose.prod.yml --env-file .env up -d
```

### 3. Custom Build

```bash
# Build with custom name and tag
./scripts/docker-build.sh --name my-temporal-ui --tag v1.0.0

# Run with custom configuration
./scripts/docker-run.sh --image my-temporal-ui --tag v1.0.0 --port 9090
```

## 🔑 User Management

### Default Users

The setup creates these test users:

| User     | Email                   | Password     | Namespaces              | Permissions                    |
| -------- | ----------------------- | ------------ | ----------------------- | ------------------------------ |
| Admin    | admin@ril.com           | admin@123    | \* (all)                | \* (all)                       |
| Limited  | limited@temporal.local  | limited@123  | default, jio-herald-plt | workflow.read, workflow.signal |
| Readonly | readonly@temporal.local | readonly@123 | default                 | workflow.read                  |

### Managing Users

```bash
# List users
./scripts/manage-temporal-users.sh list

# Create new user
./scripts/manage-temporal-users.sh create newuser@example.com "New User" "default,production" "workflow.read,workflow.signal"

# Update user permissions
./scripts/manage-temporal-users.sh update newuser@example.com "default,production,staging" "workflow.read,workflow.signal,workflow.terminate"
```

## 🛠️ Management Commands

### Container Management

```bash
# View logs
docker-compose logs -f temporal-ui

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Image Management

```bash
# Build image
./scripts/docker-build.sh

# Build without cache
./scripts/docker-build.sh --no-cache

# Build and push to registry
./scripts/docker-build.sh --push

# Run container
./scripts/docker-run.sh

# Run with custom port
./scripts/docker-run.sh --port 9090
```

### Health Checks

```bash
# Check UI health
curl http://localhost:8088/health

# Check Keycloak health
curl http://localhost:8080/health/ready

# Check all services
docker-compose ps
```

## 🔒 Security Considerations

### Production Security

1. **Change default passwords**
2. **Use HTTPS in production**
3. **Configure proper Keycloak realm settings**
4. **Use environment variables for secrets**
5. **Enable Keycloak SSL/TLS**

### Network Security

```yaml
# Add to docker-compose.yml for production
networks:
  temporal-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 📊 Monitoring

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f temporal-ui
docker-compose logs -f keycloak
```

### Metrics

- UI Health: `http://localhost:8088/health`
- Keycloak Health: `http://localhost:8080/health/ready`

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   lsof -i :8088

   # Kill the process
   kill -9 <PID>
   ```

2. **Keycloak not ready**

   ```bash
   # Wait longer for Keycloak
   sleep 60

   # Check Keycloak logs
   docker-compose logs keycloak
   ```

3. **Authentication issues**

   ```bash
   # Verify Keycloak configuration
   curl http://localhost:8080/realms/temporal-ui/.well-known/openid_configuration

   # Check UI logs
   docker-compose logs temporal-ui
   ```

### Debug Mode

```bash
# Run with debug logging
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d
```

## 📚 Additional Resources

- [Temporal UI Documentation](https://docs.temporal.io/ui)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check network connectivity between services
4. Review the configuration files
5. Ensure all required ports are available
