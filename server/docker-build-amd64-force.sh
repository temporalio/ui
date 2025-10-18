#!/bin/bash

# Force build for Linux AMD64 using tarball method
# This works around buildx limitations with --load on Mac
set -e

IMAGE_NAME="${1:-temporal-ui-auth:latest}"

echo "🔨 Building Linux AMD64 image: $IMAGE_NAME"
echo ""

# Create builder if needed
if ! docker buildx ls | grep -q "multiarch"; then
    echo "Creating multiarch builder..."
    docker buildx create --name multiarch --use
else
    docker buildx use multiarch
fi

# Build and output to tarball
echo "Building for linux/amd64 and exporting to tarball..."
docker buildx build \
    --platform linux/amd64 \
    -f Dockerfile \
    -t "$IMAGE_NAME" \
    --output type=docker,dest=temporal-ui-amd64.tar \
    .

echo ""
echo "✅ Build complete. Loading image..."

# Load the tarball
docker load < temporal-ui-amd64.tar

echo ""
echo "🔍 Verifying architecture..."
ARCH=$(docker image inspect "$IMAGE_NAME" --format '{{.Architecture}}')

if [ "$ARCH" = "amd64" ]; then
    echo "✅ Architecture: $ARCH (Linux AMD64 - Kubernetes compatible)"
    echo ""
    echo "📦 Image ready: $IMAGE_NAME"
    echo ""
    echo "🚀 Next steps:"
    echo "   docker tag $IMAGE_NAME your-registry.com/temporal-ui:v1.0.0"
    echo "   docker push your-registry.com/temporal-ui:v1.0.0"
    echo ""
    echo "🧹 Cleanup tarball:"
    echo "   rm temporal-ui-amd64.tar"
else
    echo "❌ Error: Architecture is $ARCH (expected amd64)"
    exit 1
fi

