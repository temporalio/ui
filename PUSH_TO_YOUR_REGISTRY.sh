#!/bin/bash
set -e

# Your registry details
REGISTRY="devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr"
IMAGE_NAME="temporalio/temporal-ui-auth"
NEW_TAG="0.0.9"  # Increment from 0.0.8

FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$NEW_TAG"

echo "🏷️  Tagging image..."
docker tag temporal-ui-auth:latest $FULL_IMAGE

echo "⬆️  Pushing to registry: $FULL_IMAGE"
docker push $FULL_IMAGE

echo ""
echo "✅ Image pushed successfully!"
echo ""
echo "🔄 Now update your Kubernetes deployment:"
echo ""
echo "kubectl set image deployment/temporal-ui-auth \\"
echo "  temporal-ui-auth=$FULL_IMAGE \\"
echo "  -n platform-services"
echo ""
echo "Or update your YAML:"
echo "  image: $FULL_IMAGE"
echo ""
echo "Then apply and watch:"
echo "kubectl apply -f your-deployment.yaml"
echo "kubectl rollout status deployment/temporal-ui-auth -n platform-services"
echo "kubectl get pods -n platform-services -l app=temporal-ui-auth"

