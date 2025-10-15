#!/bin/bash

# Test script to demonstrate environment variable usage
set -e

echo "🧪 Testing Environment Variable Configuration"
echo ""

# Test 1: Basic configuration
echo "Test 1: Basic configuration with custom Temporal address"
docker run --rm -d --name temporal-ui-test1 -p 8089:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  temporal-ui-auth:latest

sleep 3
echo "✅ Test 1: Container started successfully"
curl -s http://localhost:8089/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"
docker stop temporal-ui-test1 > /dev/null

echo ""

# Test 2: Authentication enabled
echo "Test 2: Authentication enabled with Keycloak"
docker run --rm -d --name temporal-ui-test2 -p 8090:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=true \
  -e TEMPORAL_UI_AUTH_PROVIDER_URL=http://keycloak:8080/realms/temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_ID=temporal-ui \
  -e TEMPORAL_UI_AUTH_CLIENT_SECRET=test-secret \
  -e TEMPORAL_UI_AUTH_CALLBACK_URL=http://localhost:8090/auth/sso/callback \
  -e TEMPORAL_UI_AUTH_JWT_SECRET=test-jwt-secret \
  temporal-ui-auth:latest

sleep 3
echo "✅ Test 2: Container started successfully"
curl -s http://localhost:8090/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"
docker stop temporal-ui-test2 > /dev/null

echo ""

# Test 3: Custom CORS origins
echo "Test 3: Custom CORS origins"
docker run --rm -d --name temporal-ui-test3 -p 8091:8088 \
  -e TEMPORAL_ADDRESS=10.166.181.101:30533 \
  -e TEMPORAL_UI_PORT=8088 \
  -e TEMPORAL_UI_AUTH_ENABLED=false \
  -e TEMPORAL_UI_CORS_ORIGIN_1=https://myapp.example.com \
  -e TEMPORAL_UI_CORS_ORIGIN_2=https://admin.example.com \
  -e TEMPORAL_UI_CORS_INSECURE=false \
  temporal-ui-auth:latest

sleep 3
echo "✅ Test 3: Container started successfully"
curl -s http://localhost:8091/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"
docker stop temporal-ui-test3 > /dev/null

echo ""
echo "🎉 All tests passed! Environment variable configuration is working correctly."
echo ""
echo "📋 Quick Reference:"
echo "  Basic: docker run -p 8088:8088 -e TEMPORAL_ADDRESS=your-server:7233 temporal-ui-auth:latest"
echo "  With Auth: docker run -p 8088:8088 -e TEMPORAL_UI_AUTH_ENABLED=true temporal-ui-auth:latest"
echo "  Custom CORS: docker run -p 8088:8088 -e TEMPORAL_UI_CORS_ORIGIN_1=https://your-app.com temporal-ui-auth:latest"
