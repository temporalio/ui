#!/bin/bash

# Verify the architecture of the Docker image
set -e

IMAGE_NAME="${1:-temporal-ui-auth:latest}"

echo "🔍 Verifying architecture of Docker image: $IMAGE_NAME"
echo ""

# Check if image exists
if ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "❌ Error: Image $IMAGE_NAME not found"
    exit 1
fi

echo "📦 Image Information:"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo ""

echo "🏗️  Architecture Information:"
docker image inspect "$IMAGE_NAME" --format '{{.Architecture}}' | while read arch; do
    if [ "$arch" = "amd64" ]; then
        echo "✅ Architecture: $arch (Linux AMD64 - Kubernetes compatible)"
    else
        echo "⚠️  Architecture: $arch (May not work in Kubernetes)"
    fi
done
echo ""

echo "🔧 Binary Verification:"
docker run --rm --entrypoint /bin/sh "$IMAGE_NAME" -c "file /app/ui-server" || echo "Could not verify binary"
echo ""

echo "🧪 Testing Binary Execution:"
if docker run --rm --entrypoint /bin/sh "$IMAGE_NAME" -c "/app/ui-server --version" > /dev/null 2>&1; then
    echo "✅ Binary executes successfully"
else
    echo "⚠️  Binary execution test - checking help..."
    docker run --rm --entrypoint /bin/sh "$IMAGE_NAME" -c "/app/ui-server --help | head -5" || echo "❌ Binary cannot execute"
fi
echo ""

echo "📋 Container Details:"
docker image inspect "$IMAGE_NAME" --format '{{json .Config}}' | grep -o '"ExposedPorts":{[^}]*}' || echo "No exposed ports info"
echo ""

echo "✨ Verification Complete!"

