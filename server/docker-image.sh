#!/bin/bash

# Linux-specific Docker build script for Temporal UI with Authorization
set -e

#pnpm build:local
#pnpm dev:docker

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="temporal-ui-auth"
TAG="latest"

FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}🔨 Building Temporal UI project first...${NC}"


docker build -f Dockerfile -t "$FULL_IMAGE_NAME" .

#docker tag temporal-ui-auth:latest devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:latest
#docker push devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:latest
