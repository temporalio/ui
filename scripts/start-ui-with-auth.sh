#!/bin/bash

# Temporal UI Startup Script with External Server and Authentication
# Usage: ./scripts/start-ui-with-auth.sh

set -e

# Default values (can be overridden by environment variables)
TEMPORAL_ADDRESS=${TEMPORAL_ADDRESS:-"127.0.0.1:7233"}
UI_PORT=${UI_PORT:-"8080"}
AUTH_ENABLED=${AUTH_ENABLED:-"false"}
AUTH_PROVIDER_URL=${AUTH_PROVIDER_URL:-"http://localhost:8080/realms/temporal-ui"}
AUTH_CLIENT_ID=${AUTH_CLIENT_ID:-"temporal-ui"}
AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET:-""}
AUTH_CALLBACK_URL=${AUTH_CALLBACK_URL:-"http://localhost:8080/auth/sso/callback"}
AUTH_SCOPES=${AUTH_SCOPES:-"openid,profile,email"}
AUTH_LABEL=${AUTH_LABEL:-"Sign in with Keycloak"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Temporal UI with External Server Configuration${NC}"

# Check if required environment variables are set for authentication
if [ "$AUTH_ENABLED" = "true" ]; then
    echo -e "${YELLOW}🔐 Authentication is enabled${NC}"
    
    if [ -z "$AUTH_PROVIDER_URL" ] || [ -z "$AUTH_CLIENT_ID" ] || [ -z "$AUTH_CLIENT_SECRET" ] || [ -z "$AUTH_CALLBACK_URL" ]; then
        echo -e "${RED}❌ Error: Authentication is enabled but required environment variables are missing:${NC}"
        echo "   - AUTH_PROVIDER_URL"
        echo "   - AUTH_CLIENT_ID" 
        echo "   - AUTH_CLIENT_SECRET"
        echo "   - AUTH_CALLBACK_URL"
        echo ""
        echo "Example:"
        echo "export AUTH_PROVIDER_URL='https://your-auth-provider.com'"
        echo "export AUTH_CLIENT_ID='your-client-id'"
        echo "export AUTH_CLIENT_SECRET='your-client-secret'"
        echo "export AUTH_CALLBACK_URL='https://your-domain:8080/auth/sso/callback'"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authentication configuration validated${NC}"
fi

# Set environment variables for the UI server
export TEMPORAL_ADDRESS="$TEMPORAL_ADDRESS"
export TEMPORAL_UI_PORT="$UI_PORT"
export TEMPORAL_AUTH_ENABLED="$AUTH_ENABLED"

if [ "$AUTH_ENABLED" = "true" ]; then
    export TEMPORAL_AUTH_PROVIDER_URL="$AUTH_PROVIDER_URL"
    export TEMPORAL_AUTH_CLIENT_ID="$AUTH_CLIENT_ID"
    export TEMPORAL_AUTH_CLIENT_SECRET="$AUTH_CLIENT_SECRET"
    export TEMPORAL_AUTH_CALLBACK_URL="$AUTH_CALLBACK_URL"
    export TEMPORAL_AUTH_SCOPES="${AUTH_SCOPES:-openid,profile,email}"
    export TEMPORAL_AUTH_LABEL="${AUTH_LABEL:-SSO Login}"
fi

# TLS configuration (optional)
if [ ! -z "$TLS_CA" ]; then
    export TEMPORAL_TLS_CA="$TLS_CA"
    export TEMPORAL_TLS_CERT="$TLS_CERT"
    export TEMPORAL_TLS_KEY="$TLS_KEY"
    export TEMPORAL_TLS_ENABLE_HOST_VERIFICATION="${TLS_ENABLE_HOST_VERIFICATION:-true}"
    export TEMPORAL_TLS_SERVER_NAME="$TLS_SERVER_NAME"
    echo -e "${GREEN}🔒 TLS configuration enabled${NC}"
fi

# CORS configuration
export TEMPORAL_CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:8080,https://localhost:8080}"

echo -e "${GREEN}📋 Configuration Summary:${NC}"
echo "   Temporal Server: $TEMPORAL_ADDRESS"
echo "   UI Port: $UI_PORT"
echo "   Authentication: $AUTH_ENABLED"
if [ "$AUTH_ENABLED" = "true" ]; then
    echo "   Auth Provider: $AUTH_PROVIDER_URL"
    echo "   Callback URL: $AUTH_CALLBACK_URL"
fi
if [ ! -z "$TLS_CA" ]; then
    echo "   TLS: Enabled"
fi
echo ""

# Check if we should use Docker or local development
if command -v docker &> /dev/null && [ "$USE_DOCKER" = "true" ]; then
    echo -e "${GREEN}🐳 Starting with Docker...${NC}"
    
    # Build the Docker command
    DOCKER_CMD="docker run -d --name temporal-ui -p $UI_PORT:$UI_PORT"
    
    # Add environment variables
    DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_ADDRESS=$TEMPORAL_ADDRESS"
    DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_UI_PORT=$UI_PORT"
    DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_ENABLED=$AUTH_ENABLED"
    
    if [ "$AUTH_ENABLED" = "true" ]; then
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_PROVIDER_URL=$AUTH_PROVIDER_URL"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_CLIENT_ID=$AUTH_CLIENT_ID"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_CLIENT_SECRET=$AUTH_CLIENT_SECRET"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_CALLBACK_URL=$AUTH_CALLBACK_URL"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_AUTH_SCOPES=${AUTH_SCOPES:-openid,profile,email}"
    fi
    
    if [ ! -z "$TLS_CA" ]; then
        DOCKER_CMD="$DOCKER_CMD -v $(dirname $TLS_CA):/certs:ro"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_TLS_CA=/certs/$(basename $TLS_CA)"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_TLS_CERT=/certs/$(basename $TLS_CERT)"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_TLS_KEY=/certs/$(basename $TLS_KEY)"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_TLS_ENABLE_HOST_VERIFICATION=${TLS_ENABLE_HOST_VERIFICATION:-true}"
        DOCKER_CMD="$DOCKER_CMD -e TEMPORAL_TLS_SERVER_NAME=$TLS_SERVER_NAME"
    fi
    
    DOCKER_CMD="$DOCKER_CMD temporalio/ui:latest"
    
    echo "Running: $DOCKER_CMD"
    eval $DOCKER_CMD
    
    echo -e "${GREEN}✅ Temporal UI started in Docker container${NC}"
    echo "   Access the UI at: http://localhost:$UI_PORT"
    
else
    echo -e "${GREEN}🔧 Starting in development mode...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        pnpm install
    fi
    
    # Build the UI
    echo -e "${YELLOW}🔨 Building UI...${NC}"
    pnpm build:server
    
    # Start the UI server
    echo -e "${GREEN}🚀 Starting UI server...${NC}"
    cd server
    go run ./cmd/server --config ./config --env production start
fi

echo ""
echo -e "${GREEN}🎉 Temporal UI is starting up!${NC}"
echo "   UI URL: http://localhost:$UI_PORT"
echo "   Temporal Server: $TEMPORAL_ADDRESS"
if [ "$AUTH_ENABLED" = "true" ]; then
    echo "   Authentication: Enabled"
fi
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   - Check the logs for any errors"
echo "   - Verify your Temporal server is accessible"
echo "   - Test authentication flow if enabled"
echo "   - Configure CORS if accessing from different domains"
