#!/bin/bash

# Complete Docker setup script for Temporal UI with Authorization
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Setting up Temporal UI with Authorization using Docker${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building project and Docker image...${NC}"
./scripts/docker-build-linux.sh

echo ""
echo -e "${YELLOW}🔧 Setting up Keycloak...${NC}"

# Start Keycloak first
docker-compose up -d keycloak

# Wait for Keycloak to be ready
echo -e "${YELLOW}⏳ Waiting for Keycloak to start...${NC}"
sleep 30

# Check if Keycloak is ready
for i in {1..30}; do
    if curl -s http://localhost:8080/health/ready >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Keycloak is ready${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for Keycloak... (${i}/30)${NC}"
    sleep 10
done

echo ""
echo -e "${YELLOW}🔑 Setting up Keycloak realm and users...${NC}"

# Run Keycloak setup scripts
if [ -f "scripts/setup-keycloak-simple.sh" ]; then
    echo -e "${YELLOW}Running Keycloak setup...${NC}"
    chmod +x scripts/setup-keycloak-simple.sh
    ./scripts/setup-keycloak-simple.sh
fi

if [ -f "scripts/manage-temporal-users.sh" ]; then
    echo -e "${YELLOW}Creating Temporal users...${NC}"
    chmod +x scripts/manage-temporal-users.sh
    ./scripts/manage-temporal-users.sh
fi

echo ""
echo -e "${YELLOW}🚀 Starting Temporal UI...${NC}"

# Start the complete stack
docker-compose up -d

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Access URLs:${NC}"
echo -e "  • Temporal UI: ${YELLOW}http://localhost:8088${NC}"
echo -e "  • Keycloak Admin: ${YELLOW}http://localhost:8080${NC}"
echo ""
echo -e "${BLUE}👤 Test Users:${NC}"
echo -e "  • Admin: ${YELLOW}admin@ril.com / admin@123${NC}"
echo -e "  • Limited: ${YELLOW}limited@temporal.local / limited@123${NC}"
echo -e "  • Readonly: ${YELLOW}readonly@temporal.local / readonly@123${NC}"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo -e "  • View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  • Stop services: ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart: ${YELLOW}docker-compose restart${NC}"
echo ""
echo -e "${GREEN}✅ Temporal UI with Authorization is now running!${NC}"
