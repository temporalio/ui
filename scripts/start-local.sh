#!/bin/bash

# Local Development Script for Temporal UI
# This script starts the UI in local development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Temporal UI (Local Development)${NC}"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Configuration
TEMPORAL_ADDRESS=${TEMPORAL_ADDRESS:-"10.177.51.206:30533"}
UI_PORT=${UI_PORT:-"8088"}
AUTH_ENABLED=${AUTH_ENABLED:-"true"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Temporal Server: $TEMPORAL_ADDRESS"
echo "   UI Port: $UI_PORT"
echo "   Auth Enabled: $AUTH_ENABLED"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
fi

# Build the UI
echo -e "${YELLOW}🔨 Building UI...${NC}"
pnpm build:server

# Build the server binary
echo -e "${YELLOW}🔨 Building server binary...${NC}"
cd server
go build -o ui-server ./cmd/server

# Set environment variables for the UI server
export TEMPORAL_ADDRESS="$TEMPORAL_ADDRESS"
export TEMPORAL_UI_PORT="$UI_PORT"
export TEMPORAL_AUTH_ENABLED="$AUTH_ENABLED"

if [ "$AUTH_ENABLED" = "true" ]; then
    export TEMPORAL_AUTH_PROVIDER_URL="${AUTH_PROVIDER_URL:-http://localhost:8080/realms/temporal-ui}"
    export TEMPORAL_AUTH_CLIENT_ID="${AUTH_CLIENT_ID:-temporal-ui}"
    export TEMPORAL_AUTH_CLIENT_SECRET="${AUTH_CLIENT_SECRET:-eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5MTE0MjlhZi0zNDRlLTRlYjctYjE4NS03NzcyYzhmZGVmYTkifQ.eyJleHAiOjE4MDMxODk5NTksImlhdCI6MTc1OTk4OTk1OSwianRpIjoiNTk5MWIxZTQtNzE4YS00ZWJiLWEzZjAtZWViMDYzMjMxNzE2IiwiaXNzIjoiaHR0cDovLzAuMC4wLjA6ODA4MC9yZWFsbXMvdGVtcG9yYWwtdWkiLCJhdWQiOiJodHRwOi8vMC4wLjAuMDo4MDgwL3JlYWxtcy90ZW1wb3JhbC11aSIsInR5cCI6IkluaXRpYWxBY2Nlc3NUb2tlbiJ9.ijwzY4QAIt5YOu9R_EYfeEJklsRwmFbVBXeH67YpOlKsZ8mJlplImB8I-KDjTyXX61QdmuVRr-9JyR4zPG7_5g}"
    export TEMPORAL_AUTH_CALLBACK_URL="${AUTH_CALLBACK_URL:-http://localhost:8080/auth/sso/callback}"
    export TEMPORAL_AUTH_SCOPES="${AUTH_SCOPES:-openid,profile,email}"
    export TEMPORAL_AUTH_LABEL="${AUTH_LABEL:-Sign in with Keycloak}"
    
    echo -e "${GREEN}🔐 Authentication Configuration:${NC}"
    echo "   Provider URL: $TEMPORAL_AUTH_PROVIDER_URL"
    echo "   Client ID: $TEMPORAL_AUTH_CLIENT_ID"
    echo "   Callback URL: $TEMPORAL_AUTH_CALLBACK_URL"
    echo ""
fi

# Start the server
echo -e "${GREEN}🚀 Starting UI server...${NC}"
echo -e "${YELLOW}💡 Using local configuration...${NC}"

# Use local configuration
./ui-server --config ./config --env local start
