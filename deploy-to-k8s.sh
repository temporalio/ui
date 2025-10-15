#!/bin/bash
set -e

# Configuration
VERSION="${1:-0.0.10}"
REGISTRY="devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio"
IMAGE_NAME="temporal-ui-auth"
NAMESPACE="platform-services"
FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$VERSION"

echo "🎯 Temporal UI Deployment to Kubernetes"
echo "========================================"
echo "Version: $VERSION"
echo "Registry: $REGISTRY"
echo "Namespace: $NAMESPACE"
echo ""

# Check if we're in the right directory
if [ ! -f "server/docker-build-amd64-force.sh" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "   Expected: /Users/sagar.prasad/Documents/office/code/temporal/ui"
    exit 1
fi

# Step 1: Build
echo "🏗️  Step 1/5: Building image for Linux AMD64..."
./server/docker-build-amd64-force.sh

# Verify build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 2: Tag
echo ""
echo "🏷️  Step 2/5: Tagging image..."
docker tag temporal-ui-auth:latest $FULL_IMAGE
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:latest

# Step 3: Push
echo ""
echo "📤 Step 3/5: Pushing to registry..."
echo "Pushing $FULL_IMAGE ..."
docker push $FULL_IMAGE

echo "Pushing $REGISTRY/$IMAGE_NAME:latest ..."
docker push $REGISTRY/$IMAGE_NAME:latest

# Step 4: Update Kubernetes
echo ""
echo "🚀 Step 4/5: Updating Kubernetes deployment..."
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=$FULL_IMAGE \
  -n $NAMESPACE

if [ $? -ne 0 ]; then
    echo "❌ Failed to update deployment"
    exit 1
fi

# Step 5: Wait for rollout
echo ""
echo "⏳ Step 5/5: Waiting for rollout to complete..."
kubectl rollout status deployment/temporal-ui-auth -n $NAMESPACE --timeout=5m

if [ $? -ne 0 ]; then
    echo "❌ Rollout failed or timed out"
    echo ""
    echo "Check pod logs:"
    echo "kubectl logs -f deployment/temporal-ui-auth -n $NAMESPACE"
    exit 1
fi

# Success!
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Pod status:"
kubectl get pods -n $NAMESPACE -l app=temporal-ui-auth

echo ""
echo "📝 Deployed image:"
kubectl get deployment/temporal-ui-auth -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""

echo ""
echo "🔍 Next steps:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Hard refresh page (Ctrl+F5)"
echo "3. Navigate to: http://10.166.181.98:30189"
echo ""
echo "📋 View logs:"
echo "kubectl logs -f deployment/temporal-ui-auth -n $NAMESPACE"
echo ""
echo "🐛 Debug pod:"
echo "kubectl exec -it deployment/temporal-ui-auth -n $NAMESPACE -- /bin/sh"

