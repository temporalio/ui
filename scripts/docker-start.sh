#!/bin/bash

# Docker startup script with environment variable support
set -e

# Default values
TEMPORAL_ADDRESS=${TEMPORAL_ADDRESS:-"temporal:7233"}
TEMPORAL_UI_PORT=${TEMPORAL_UI_PORT:-"8088"}
TEMPORAL_UI_AUTH_ENABLED=${TEMPORAL_UI_AUTH_ENABLED:-"false"}
TEMPORAL_UI_AUTH_PROVIDER_URL=${TEMPORAL_UI_AUTH_PROVIDER_URL:-"http://keycloak:8080/realms/temporal-ui"}
TEMPORAL_UI_AUTH_CLIENT_ID=${TEMPORAL_UI_AUTH_CLIENT_ID:-"temporal-ui"}
TEMPORAL_UI_AUTH_CLIENT_SECRET=${TEMPORAL_UI_AUTH_CLIENT_SECRET:-"your-jwt-secret-key-for-temporal-ui"}
TEMPORAL_UI_AUTH_CALLBACK_URL=${TEMPORAL_UI_AUTH_CALLBACK_URL:-"http://localhost:8088/auth/sso/callback"}
TEMPORAL_UI_AUTH_JWT_SECRET=${TEMPORAL_UI_AUTH_JWT_SECRET:-"your-jwt-secret-key-for-temporal-ui"}
TEMPORAL_UI_CORS_ORIGIN_1=${TEMPORAL_UI_CORS_ORIGIN_1:-"http://localhost:8088"}
TEMPORAL_UI_CORS_ORIGIN_2=${TEMPORAL_UI_CORS_ORIGIN_2:-"http://localhost:8080"}
TEMPORAL_UI_CORS_ORIGIN_3=${TEMPORAL_UI_CORS_ORIGIN_3:-"http://keycloak:8080"}
TEMPORAL_UI_CORS_INSECURE=${TEMPORAL_UI_CORS_INSECURE:-"true"}
TEMPORAL_UI_CODEC_ENDPOINT=${TEMPORAL_UI_CODEC_ENDPOINT:-""}

# Create a docker config file with environment variables substituted
cat > ./config/docker.yaml << EOF
# Docker configuration for Temporal UI with Authorization
temporalGrpcAddress: "$TEMPORAL_ADDRESS"
port: $TEMPORAL_UI_PORT
enableUi: true
defaultNamespace: "default"
showTemporalSystemNamespace: false
notifyOnNewVersion: true
disableWriteActions: false

# Authentication configuration
auth:
  enabled: $TEMPORAL_UI_AUTH_ENABLED
  providers:
    - label: "SSO Login"
      type: "oidc"
      providerUrl: "$TEMPORAL_UI_AUTH_PROVIDER_URL"
      issuerUrl: ""
      clientId: "$TEMPORAL_UI_AUTH_CLIENT_ID"
      clientSecret: "$TEMPORAL_UI_AUTH_CLIENT_SECRET"
      scopes:
        - "openid"
        - "profile"
        - "email"
      callbackUrl: "$TEMPORAL_UI_AUTH_CALLBACK_URL"
      useIdTokenAsBearer: false
      options:
        audience: "temporal-ui"

# JWT Secret for token validation
jwtSecret: "$TEMPORAL_UI_AUTH_JWT_SECRET"

# TLS configuration (disabled for Docker)
tls:
  enableHostVerification: false

# CORS configuration for Docker
cors:
  cookieInsecure: $TEMPORAL_UI_CORS_INSECURE
  allowOrigins:
    - "$TEMPORAL_UI_CORS_ORIGIN_1"
    - "$TEMPORAL_UI_CORS_ORIGIN_2"
    - "$TEMPORAL_UI_CORS_ORIGIN_3"
  unsafeAllowAllOrigins: false

# Optional: Codec configuration
codec:
  endpoint: "$TEMPORAL_UI_CODEC_ENDPOINT"
  passAccessToken: true
  includeCredentials: false
  defaultErrorMessage: "Failed to decode data"
  defaultErrorLink: "https://docs.temporal.io/data-converters"

# Forward headers from UI to Temporal server
forwardHeaders:
  - "X-Forwarded-For"
  - "X-Real-IP"
EOF

# Start the server with the generated config
exec ./ui-server --config ./config --env docker start
