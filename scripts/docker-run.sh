#!/bin/bash

# Docker run script for Temporal UI with Authorization
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="temporal-ui-auth"
TAG="latest"
CONTAINER_NAME="temporal-ui"
PORT="8088"
ENV_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--image)
      IMAGE_NAME="$2"
      shift 2
      ;;
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    -c|--container)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -e|--env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --rm)
      REMOVE=true
      shift
      ;;
    -d|--detach)
      DETACH=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -i, --image IMAGE     Docker image name (default: temporal-ui-auth)"
      echo "  -t, --tag TAG         Docker image tag (default: latest)"
      echo "  -c, --container NAME  Container name (default: temporal-ui)"
      echo "  -p, --port PORT       Host port to bind (default: 8088)"
      echo "  -e, --env-file FILE   Environment file to load"
      echo "  --rm                  Remove container after exit"
      echo "  -d, --detach          Run in background"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Check if image exists
if ! docker image inspect "$FULL_IMAGE_NAME" >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker image not found: ${FULL_IMAGE_NAME}${NC}"
    echo -e "${YELLOW}Run './scripts/docker-build.sh' to build the image first${NC}"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Stopping existing container: ${CONTAINER_NAME}${NC}"
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Build docker run command
DOCKER_CMD="docker run"

if [ "$DETACH" = true ]; then
    DOCKER_CMD="$DOCKER_CMD -d"
fi

if [ "$REMOVE" = true ]; then
    DOCKER_CMD="$DOCKER_CMD --rm"
fi

if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
    DOCKER_CMD="$DOCKER_CMD --env-file $ENV_FILE"
fi

DOCKER_CMD="$DOCKER_CMD --name $CONTAINER_NAME"
DOCKER_CMD="$DOCKER_CMD -p $PORT:8088"
DOCKER_CMD="$DOCKER_CMD $FULL_IMAGE_NAME"

echo -e "${YELLOW}Starting container: ${CONTAINER_NAME}${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"
echo -e "${YELLOW}Port: ${PORT} -> 8088${NC}"

# Run the container
eval $DOCKER_CMD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo -e "${YELLOW}Access the UI at: http://localhost:${PORT}${NC}"
    
    if [ "$DETACH" = true ]; then
        echo -e "${YELLOW}Container is running in background${NC}"
        echo -e "${YELLOW}To view logs: docker logs -f ${CONTAINER_NAME}${NC}"
        echo -e "${YELLOW}To stop: docker stop ${CONTAINER_NAME}${NC}"
    fi
else
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi
