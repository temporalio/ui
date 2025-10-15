#!/bin/bash

# Linux-specific Docker build script for Temporal UI with Authorization
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="temporal-ui-auth"
TAG="latest"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--name)
      IMAGE_NAME="$2"
      shift 2
      ;;
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -n, --name NAME     Docker image name (default: temporal-ui-auth)"
      echo "  -t, --tag TAG       Docker image tag (default: latest)"
      echo "  --push              Push image to registry after build"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}🔨 Building Temporal UI project first...${NC}"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo -e "${YELLOW}📦 Building frontend...${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        if command -v pnpm &> /dev/null; then
            pnpm install
        else
            npm install
        fi
    fi
    
    # Build the frontend
    if command -v pnpm &> /dev/null; then
        pnpm run build
    else
        npm run build
    fi
else
    echo -e "${GREEN}✅ Build directory already exists${NC}"
fi

echo -e "${YELLOW}🔨 Building Go server for Linux AMD64...${NC}"

# Build Go binary for Linux AMD64
cd server
echo -e "${YELLOW}Cross-compiling for linux/amd64...${NC}"
GOOS=linux GOARCH=amd64 go build -o ui-server-linux ./cmd/server
cd ..

echo -e "${YELLOW}🐳 Building Docker image: ${FULL_IMAGE_NAME}${NC}"

# Create a temporary Dockerfile that uses the Linux binary
cat > Dockerfile.linux << 'EOF'
# Simple Dockerfile for Temporal UI with Authorization (Linux)
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata wget curl

# Create non-root user
RUN addgroup -g 1001 -S temporal && \
    adduser -u 1001 -S temporal -G temporal

# Set working directory
WORKDIR /app

# Copy the existing build directory
COPY build/ ./build/

# Copy server binary (Linux version)
COPY server/ui-server-linux ./ui-server
RUN chmod +x ./ui-server

# Copy configuration files
COPY server/config/ ./config/

# Copy Keycloak plugins
COPY keycloak-plugins/ ./keycloak-plugins/

# Copy scripts
COPY scripts/ ./scripts/

# Set ownership
RUN chown -R temporal:temporal /app

# Switch to non-root user
USER temporal

# Expose port
EXPOSE 8088

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8088/health || exit 1

# Start the server
CMD ["./ui-server", "--config", "./config", "--env", "production", "start"]
EOF

# Build the image using the Linux-specific Dockerfile
docker build -f Dockerfile.linux -t "$FULL_IMAGE_NAME" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully: ${FULL_IMAGE_NAME}${NC}"
    
    # Show image size
    echo -e "${YELLOW}Image size:${NC}"
    docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    # Clean up temporary files
    rm -f Dockerfile.linux
    rm -f server/ui-server-linux
    
    # Push if requested
    if [ "$PUSH" = true ]; then
        echo -e "${YELLOW}Pushing image to registry...${NC}"
        docker push "$FULL_IMAGE_NAME"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Image pushed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to push image${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ Docker build failed${NC}"
    # Clean up temporary files
    rm -f Dockerfile.linux
    rm -f server/ui-server-linux
    exit 1
fi
