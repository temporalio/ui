# Temporal UI Deployment Guide

This guide explains how to deploy the Temporal UI to connect to an external Temporal server with authentication enabled.

## Prerequisites

- External Temporal server running and accessible
- Authentication provider (OIDC-compatible) configured
- TLS certificates if your Temporal server uses TLS

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Using Docker Run

```bash
docker run -d \
  --name temporal-ui \
  -p 8080:8080 \
  -e TEMPORAL_ADDRESS="your-temporal-server:7233" \
  -e TEMPORAL_UI_PORT="8080" \
  -e TEMPORAL_AUTH_ENABLED="true" \
  -e TEMPORAL_AUTH_PROVIDER_URL="https://your-auth-provider.com" \
  -e TEMPORAL_AUTH_CLIENT_ID="your-client-id" \
  -e TEMPORAL_AUTH_CLIENT_SECRET="your-client-secret" \
  -e TEMPORAL_AUTH_CALLBACK_URL="https://your-domain:8080/auth/sso/callback" \
  -e TEMPORAL_AUTH_SCOPES="openid,email,profile" \
  -e TEMPORAL_TLS_CA="/certs/ca.cert" \
  -e TEMPORAL_TLS_CERT="/certs/cert.pem" \
  -e TEMPORAL_TLS_KEY="/certs/key.pem" \
  -e TEMPORAL_TLS_ENABLE_HOST_VERIFICATION="true" \
  -e TEMPORAL_TLS_SERVER_NAME="your-temporal-server" \
  -v /path/to/certs:/certs:ro \
  temporalio/ui:latest
```

#### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  temporal-ui:
    image: temporalio/ui:latest
    ports:
      - '8080:8080'
    environment:
      - TEMPORAL_ADDRESS=your-temporal-server:7233
      - TEMPORAL_UI_PORT=8080
      - TEMPORAL_AUTH_ENABLED=true
      - TEMPORAL_AUTH_PROVIDER_URL=https://your-auth-provider.com
      - TEMPORAL_AUTH_CLIENT_ID=your-client-id
      - TEMPORAL_AUTH_CLIENT_SECRET=your-client-secret
      - TEMPORAL_AUTH_CALLBACK_URL=https://your-domain:8080/auth/sso/callback
      - TEMPORAL_AUTH_SCOPES=openid,email,profile
      - TEMPORAL_TLS_CA=/certs/ca.cert
      - TEMPORAL_TLS_CERT=/certs/cert.pem
      - TEMPORAL_TLS_KEY=/certs/key.pem
      - TEMPORAL_TLS_ENABLE_HOST_VERIFICATION=true
      - TEMPORAL_TLS_SERVER_NAME=your-temporal-server
    volumes:
      - /path/to/certs:/certs:ro
    restart: unless-stopped
```

### Option 2: Standalone Binary Deployment

#### Build the UI Server

```bash
# Navigate to the server directory
cd server

# Build the binary
go build -o ui-server ./cmd/server

# Run with custom config
./ui-server start --config ./config --env production
```

#### Using the Built Binary

```bash
# Set environment variables
export TEMPORAL_ADDRESS="your-temporal-server:7233"
export TEMPORAL_AUTH_ENABLED="true"
export TEMPORAL_AUTH_PROVIDER_URL="https://your-auth-provider.com"
export TEMPORAL_AUTH_CLIENT_ID="your-client-id"
export TEMPORAL_AUTH_CLIENT_SECRET="your-client-secret"
export TEMPORAL_AUTH_CALLBACK_URL="https://your-domain:8080/auth/sso/callback"
export TEMPORAL_AUTH_SCOPES="openid,email,profile"

# Run the server
./ui-server start --config ./config --env production
```

### Option 3: Development Mode

For development and testing:

```bash
# Install dependencies
pnpm install

# Build the UI
pnpm build:server

# Run the UI server with custom config
cd server
go run ./cmd/server start --config ./config --env production
```

## Authentication Configuration

### Supported Authentication Providers

The UI supports OIDC-compatible authentication providers:

- **Auth0**: `https://your-domain.auth0.com/`
- **Google**: `https://accounts.google.com`
- **Microsoft Azure AD**: `https://login.microsoftonline.com/your-tenant-id/v2.0`
- **Keycloak**: `https://your-keycloak-server/realms/your-realm`
- **Okta**: `https://your-domain.okta.com/oauth2/default`

### Configuration Parameters

| Parameter                     | Description                                      | Required |
| ----------------------------- | ------------------------------------------------ | -------- |
| `TEMPORAL_AUTH_ENABLED`       | Enable authentication                            | Yes      |
| `TEMPORAL_AUTH_PROVIDER_URL`  | OIDC provider URL                                | Yes      |
| `TEMPORAL_AUTH_CLIENT_ID`     | OAuth client ID                                  | Yes      |
| `TEMPORAL_AUTH_CLIENT_SECRET` | OAuth client secret                              | Yes      |
| `TEMPORAL_AUTH_CALLBACK_URL`  | Callback URL for OAuth flow                      | Yes      |
| `TEMPORAL_AUTH_SCOPES`        | OAuth scopes (comma-separated)                   | No       |
| `TEMPORAL_AUTH_ISSUER_URL`    | OIDC issuer URL (if different from provider URL) | No       |
| `TEMPORAL_AUTH_LABEL`         | Button label for login                           | No       |

### Example Auth0 Configuration

```bash
export TEMPORAL_AUTH_ENABLED="true"
export TEMPORAL_AUTH_PROVIDER_URL="https://your-domain.auth0.com/"
export TEMPORAL_AUTH_CLIENT_ID="your-auth0-client-id"
export TEMPORAL_AUTH_CLIENT_SECRET="your-auth0-client-secret"
export TEMPORAL_AUTH_CALLBACK_URL="https://your-domain:8080/auth/sso/callback"
export TEMPORAL_AUTH_SCOPES="openid,profile,email"
```

### Example Google OAuth Configuration

```bash
export TEMPORAL_AUTH_ENABLED="true"
export TEMPORAL_AUTH_PROVIDER_URL="https://accounts.google.com"
export TEMPORAL_AUTH_CLIENT_ID="your-google-client-id"
export TEMPORAL_AUTH_CLIENT_SECRET="your-google-client-secret"
export TEMPORAL_AUTH_CALLBACK_URL="https://your-domain:8080/auth/sso/callback"
export TEMPORAL_AUTH_SCOPES="openid,profile,email"
```

## TLS Configuration

If your Temporal server uses TLS, configure the UI server accordingly:

```bash
export TEMPORAL_TLS_CA="/path/to/ca.cert"
export TEMPORAL_TLS_CERT="/path/to/cert.pem"
export TEMPORAL_TLS_KEY="/path/to/key.pem"
export TEMPORAL_TLS_ENABLE_HOST_VERIFICATION="true"
export TEMPORAL_TLS_SERVER_NAME="your-temporal-server"
```

## Security Considerations

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Secrets**: Store client secrets securely (use secret management)
3. **CORS Configuration**: Configure CORS properly for your domain
4. **TLS Verification**: Enable TLS host verification for production
5. **Network Security**: Use firewalls and network policies

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if Temporal server is accessible
2. **Authentication Fails**: Verify OIDC configuration
3. **TLS Errors**: Check certificate configuration
4. **CORS Issues**: Configure allowed origins properly

### Debug Mode

Enable debug logging:

```bash
export TEMPORAL_LOG_LEVEL="debug"
```

### Health Check

Check if the UI server is running:

```bash
curl http://localhost:8080/health
```

## Monitoring

The UI server exposes metrics and health endpoints:

- Health: `GET /health`
- Metrics: `GET /metrics` (if enabled)

## Production Checklist

- [ ] External Temporal server is accessible
- [ ] Authentication provider is configured
- [ ] TLS certificates are valid
- [ ] CORS is properly configured
- [ ] Secrets are stored securely
- [ ] Monitoring is set up
- [ ] Backup strategy is in place
