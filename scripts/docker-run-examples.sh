#!/bin/bash

# Docker run examples for Temporal UI with Authorization
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Temporal UI Docker Run Examples${NC}"
echo ""

echo -e "${YELLOW}1. Basic run without authentication:${NC}"
cat << 'EOF'
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  temporal-ui-auth:latest
EOF

echo ""
echo -e "${YELLOW}2. Run with authentication (Keycloak):${NC}"
cat << 'EOF'
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_SECRET=your-jwt-secret-key-for-temporal-ui \
  -e TEMPORAL_UI_AUTH_CALLBACK_URL=http://localhost:8088/auth/sso/callback \
  -e TEMPORAL_UI_AUTH_JWT_SECRET=your-jwt-secret-key-for-temporal-ui \
  temporal-ui-auth:latest
EOF

echo ""
echo -e "${YELLOW}3. Run with custom CORS origins:${NC}"
cat << 'EOF'
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  -e TEMPORAL_UI_CORS_ORIGIN_1=https://myapp.example.com \
  -e TEMPORAL_UI_CORS_ORIGIN_2=https://admin.example.com \
  -e TEMPORAL_UI_CORS_INSECURE=false \
  temporal-ui-auth:latest
EOF

echo ""
echo -e "${YELLOW}4. Run with codec server:${NC}"
cat << 'EOF'
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  -e TEMPORAL_UI_CODEC_ENDPOINT=http://codec-server:8080 \
  temporal-ui-auth:latest
EOF

echo ""
echo -e "${YELLOW}5. Production run with all options:${NC}"
cat << 'EOF'
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=production-temporal:7233 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=https://auth.company.com/realms/temporal \
  -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui-prod \
  -e TEMPORAL_UI_AUTH_CLIENT_SECRET=super-secret-jwt-key \
  -e TEMPORAL_UI_AUTH_CALLBACK_URL=https://temporal.company.com/auth/sso/callback \
  -e TEMPORAL_UI_AUTH_JWT_SECRET=super-secret-jwt-key \
  -e TEMPORAL_UI_CORS_ORIGIN_1=https://temporal.company.com \
  -e TEMPORAL_UI_CORS_ORIGIN_2=https://admin.company.com \
  -e TEMPORAL_UI_CORS_INSECURE=false \
  -e TEMPORAL_UI_CODEC_ENDPOINT=https://codec.company.com:8080 \
  temporal-ui-auth:latest
EOF

echo ""
echo -e "${GREEN}📋 Available Environment Variables:${NC}"
echo ""
echo -e "${BLUE}Core Configuration:${NC}"
echo "  TEMPORAL_ADDRESS              - Temporal server address (default: temporal:7233)"
echo "  TEMPORAL_UI_PORT             - UI server port (default: 8088)"
echo ""
echo -e "${BLUE}Authentication:${NC}"
echo "  TEMPORAL_UI_AUTH_ENABLED     - Enable authentication (default: false)"
echo "  TEMPORAL_UI_AUTH_PROVIDER_URL - OIDC provider URL"
echo "  TEMPORAL_UI_AUTH_CLIENT_ID   - OIDC client ID"
echo "  TEMPORAL_UI_AUTH_CLIENT_SECRET - OIDC client secret"
echo "  TEMPORAL_UI_AUTH_CALLBACK_URL - OIDC callback URL"
echo "  TEMPORAL_UI_AUTH_JWT_SECRET  - JWT secret for token validation"
echo "  TEMPORAL_UI_AUTH_ISSUER_URL  - OIDC issuer URL (optional)"
echo "  TEMPORAL_UI_AUTH_AUDIENCE    - OIDC audience (default: temporal-ui)"
echo ""
echo -e "${BLUE}CORS Configuration:${NC}"
echo "  TEMPORAL_UI_CORS_ORIGIN_1    - First allowed origin"
echo "  TEMPORAL_UI_CORS_ORIGIN_2    - Second allowed origin"
echo "  TEMPORAL_UI_CORS_ORIGIN_3    - Third allowed origin"
echo "  TEMPORAL_UI_CORS_INSECURE    - Allow insecure cookies (default: true)"
echo "  TEMPORAL_UI_CORS_UNSAFE_ALLOW_ALL - Allow all origins (default: false)"
echo ""
echo -e "${BLUE}Codec Configuration:${NC}"
echo "  TEMPORAL_UI_CODEC_ENDPOINT  - Codec server endpoint (optional)"
echo ""
echo -e "${GREEN}✅ All environment variables are optional and have sensible defaults!${NC}"
