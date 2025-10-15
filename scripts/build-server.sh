#!/bin/bash

# Build script for Temporal UI server
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔨 Building Temporal UI server...${NC}"

# Check if we're in the right directory
if [ ! -f "server/go.mod" ]; then
    echo -e "${RED}❌ Not in the correct directory. Please run from the project root.${NC}"
    exit 1
fi

# Go to server directory
cd server

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go first.${NC}"
    exit 1
fi

# Clean previous build
if [ -f "ui-server" ]; then
    echo -e "${YELLOW}Cleaning previous build...${NC}"
    rm -f ui-server
fi

# Download dependencies
echo -e "${YELLOW}📦 Downloading dependencies...${NC}"
go mod download

# Build the server
echo -e "${YELLOW}🔨 Building server binary...${NC}"
go build -o ui-server ./cmd/server

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server built successfully: ui-server${NC}"
    
    # Show binary size
    if [ -f "ui-server" ]; then
        echo -e "${YELLOW}Binary size:${NC}"
        ls -lh ui-server
    fi
else
    echo -e "${RED}❌ Server build failed${NC}"
    exit 1
fi

# Go back to project root
cd ..

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${YELLOW}You can now run: ./scripts/docker-build-simple.sh${NC}"
