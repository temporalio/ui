#!/bin/bash

# Docker build script for Linux AMD64 (Kubernetes compatible)
# Forces build for Linux AMD64 architecture regardless of host platform
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
PLATFORM="linux/amd64"
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
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Build Docker image for Linux AMD64 (Kubernetes compatible)"
      echo ""
      echo "Options:"
      echo "  --tag TAG          Set image tag (default: latest)"
      echo "  --name NAME        Set image name (default: temporal-ui-auth)"
      echo "  --platform PLATFORM Set platform (default: linux/amd64)"
      echo "  --help             Show this help message"
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
echo -e "${BLUE}║${NC}  Building Temporal UI for Linux AMD64 (Kubernetes)          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Build Configuration:${NC}"
echo -e "   Image Name: ${GREEN}${IMAGE_NAME}${NC}"
echo -e "   Tag:        ${GREEN}${TAG}${NC}"
echo -e "   Full Name:  ${GREEN}${FULL_IMAGE_NAME}${NC}"
echo -e "   Platform:   ${GREEN}${PLATFORM}${NC}"
echo -e "   Project:    ${GREEN}${PROJECT_ROOT}${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}❌ Error: $DOCKERFILE not found in project root${NC}"
    exit 1
fi

# Check if docker buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker buildx not found. Trying to enable it...${NC}"
    docker buildx create --use || echo -e "${YELLOW}Note: buildx setup may need manual configuration${NC}"
fi

# Build Docker image for specific platform
echo -e "${YELLOW}🐳 Building Docker image for ${PLATFORM}: ${FULL_IMAGE_NAME}${NC}"
echo -e "${YELLOW}   This may take a few minutes...${NC}"
echo ""

if docker buildx build --platform "$PLATFORM" -f "$DOCKERFILE" -t "$FULL_IMAGE_NAME" --load .; then
    echo ""
    echo -e "${GREEN}✅ Docker image built successfully: ${FULL_IMAGE_NAME}${NC}"
    
    # Show image info
    echo ""
    echo -e "${YELLOW}📦 Image Information:${NC}"
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -n 2
    
    # Verify architecture
    echo ""
    echo -e "${YELLOW}🏗️  Architecture Verification:${NC}"
    ARCH=$(docker image inspect "$FULL_IMAGE_NAME" --format '{{.Architecture}}')
    if [ "$ARCH" = "amd64" ]; then
        echo -e "   ${GREEN}✅ Architecture: $ARCH (Linux AMD64 - Kubernetes compatible)${NC}"
    else
        echo -e "   ${RED}⚠️  Architecture: $ARCH (Expected: amd64)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  Build Complete - Ready for Kubernetes!                     ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🚀 To test locally:${NC}"
    echo -e "   ${YELLOW}docker run --rm -p 8088:8088 ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${BLUE}🔧 To verify architecture:${NC}"
    echo -e "   ${YELLOW}./server/verify-arch.sh${NC}"
    echo ""
    echo -e "${BLUE}📦 To push to registry:${NC}"
    echo -e "   ${YELLOW}docker tag ${FULL_IMAGE_NAME} your-registry/temporal-ui-auth:${TAG}${NC}"
    echo -e "   ${YELLOW}docker push your-registry/temporal-ui-auth:${TAG}${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Docker build failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "1. Ensure Docker Desktop has buildx enabled"
    echo -e "2. Try: ${YELLOW}docker buildx create --use${NC}"
    echo -e "3. Check: ${YELLOW}docker buildx ls${NC}"
    echo -e "4. See: ${YELLOW}server/DOCKER_BUILD_TROUBLESHOOTING.md${NC}"
    exit 1
fi

