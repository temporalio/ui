#!/bin/bash

# Simple Temporal UI Startup Script
# This script builds and runs the UI server with external Temporal server and authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Temporal UI (Simple Mode)${NC}"

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

# Build the server binary
echo -e "${YELLOW}🔨 Building server binary...${NC}"
cd server
go build -o ui-server ./cmd/server

# Start the server
echo -e "${GREEN}🚀 Starting UI server...${NC}"
echo -e "${YELLOW}💡 Configuration:${NC}"
echo "   Temporal Server: ${TEMPORAL_ADDRESS:-127.0.0.1:7233}"
echo "   UI Port: ${UI_PORT:-8080}"
echo "   Auth Enabled: ${AUTH_ENABLED:-false}"
if [ "$AUTH_ENABLED" = "true" ]; then
    echo "   Auth Provider: ${AUTH_PROVIDER_URL}"
    echo "   Client ID: ${AUTH_CLIENT_ID}"
fi
echo ""

# Run the server with the correct flags
./ui-server --config ./config --env production start
