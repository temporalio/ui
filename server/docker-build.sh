#!/bin/bash

# Docker build script for Temporal UI with Authorization
# This script builds the UI locally first, then creates a Docker image
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="temporal-ui-auth"
TAG="latest"
DOCKERFILE="Dockerfile"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      TAG="$2"
      FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"
      shift 2
      ;;
    --name)
      IMAGE_NAME="$2"
      FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --tag TAG       Set image tag (default: latest)"
      echo "  --name NAME     Set image name (default: temporal-ui-auth)"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  Building Temporal UI Docker Image                          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Build Configuration:${NC}"
echo -e "   Image Name: ${GREEN}${IMAGE_NAME}${NC}"
echo -e "   Tag:        ${GREEN}${TAG}${NC}"
echo -e "   Full Name:  ${GREEN}${FULL_IMAGE_NAME}${NC}"
echo -e "   Project:    ${GREEN}${PROJECT_ROOT}${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}❌ Error: $DOCKERFILE not found in project root${NC}"
    exit 1
fi

# Build Docker image
echo -e "${YELLOW}🐳 Building Docker image: ${FULL_IMAGE_NAME}${NC}"
echo ""

if docker build -f "$DOCKERFILE" -t "$FULL_IMAGE_NAME" .; then
    echo ""
    echo -e "${GREEN}✅ Docker image built successfully: ${FULL_IMAGE_NAME}${NC}"
    
    # Show image info
    echo ""
    echo -e "${YELLOW}📦 Image Information:${NC}"
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -n 2
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  Build Complete!                                             ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🚀 To run the image:${NC}"
    echo -e "   ${YELLOW}docker run --rm -p 8088:8088 ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${BLUE}🔧 To run with custom Temporal server:${NC}"
    echo -e "   ${YELLOW}docker run --rm -p 8088:8088 \\${NC}"
    echo -e "   ${YELLOW}  -e TEMPORAL_ADDRESS=your-server:7233 \\${NC}"
    echo -e "   ${YELLOW}  ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${BLUE}📚 For more options, see:${NC}"
    echo -e "   ${YELLOW}DOCKER_ENVIRONMENT_VARIABLES.md${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

