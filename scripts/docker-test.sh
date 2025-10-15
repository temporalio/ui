#!/bin/bash

# Test script for Temporal UI Docker container
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
TEMPORAL_ADDRESS="localhost:7233"
PORT="8088"
AUTH_ENABLED="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--address)
      TEMPORAL_ADDRESS="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    --auth)
      AUTH_ENABLED="true"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -a, --address ADDR    Temporal server address (default: localhost:7233)"
      echo "  -p, --port PORT      Host port to bind (default: 8088)"
      echo "  --auth               Enable authentication"
      echo "  -h, --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}🐳 Testing Temporal UI Docker container...${NC}"
echo -e "${YELLOW}Temporal Address: ${TEMPORAL_ADDRESS}${NC}"
echo -e "${YELLOW}Port: ${PORT}${NC}"
echo -e "${YELLOW}Authentication: ${AUTH_ENABLED}${NC}"

# Stop any existing container
if docker ps -a --format '{{.Names}}' | grep -q "temporal-ui-test"; then
    echo -e "${YELLOW}Stopping existing test container...${NC}"
    docker stop temporal-ui-test >/dev/null 2>&1 || true
    docker rm temporal-ui-test >/dev/null 2>&1 || true
fi

# Build environment variables
ENV_VARS="-e TEMPORAL_ADDRESS=${TEMPORAL_ADDRESS}"
ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_PORT=8088"
ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_ENABLED=${AUTH_ENABLED}"

if [ "$AUTH_ENABLED" = "true" ]; then
    ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui"
    ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui"
    ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_CLIENT_SECRET=your-jwt-secret-key-for-temporal-ui"
    ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_CALLBACK_URL=http://localhost:${PORT}/auth/sso/callback"
    ENV_VARS="${ENV_VARS} -e TEMPORAL_UI_AUTH_JWT_SECRET=your-jwt-secret-key-for-temporal-ui"
fi

# Run the container
echo -e "${YELLOW}Starting container...${NC}"
docker run --rm --name temporal-ui-test \
  -p ${PORT}:8088 \
  ${ENV_VARS} \
  temporal-ui-auth:latest \
  ./ui-server --config ./config --env docker start

echo -e "${GREEN}✅ Container test completed${NC}"
