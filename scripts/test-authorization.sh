#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Temporal UI Authorization${NC}"
echo "=================================="

# Test configuration
TEMPORAL_UI_URL="http://localhost:8088"
KEYCLOAK_URL="http://localhost:8080"

echo -e "${YELLOW}📋 Test Plan:${NC}"
echo "1. Test admin user (should have full access)"
echo "2. Test limited user (should have limited access)"
echo "3. Test readonly user (should have read-only access)"
echo ""

# Function to test user access
test_user_access() {
    local username=$1
    local password=$2
    local expected_namespaces=$3
    local expected_permissions=$4
    
    echo -e "${BLUE}Testing user: $username${NC}"
    
    # Get JWT token from Keycloak
    echo "Getting JWT token from Keycloak..."
    TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/temporal-ui/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=temporal-ui" \
        -d "client_secret=kRIJLLmrhnEmTT0f1hWsB3X8IcZGpBYW" \
        -d "username=$username" \
        -d "password=$password")
    
    if echo "$TOKEN_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Failed to get token for $username${NC}"
        echo "Response: $TOKEN_RESPONSE"
        return 1
    fi
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
    
    if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ No access token received for $username${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Token received for $username${NC}"
    
    # Test Temporal UI API access
    echo "Testing Temporal UI API access..."
    API_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "X-Temporal-Namespace: default" \
        "$TEMPORAL_UI_URL/api/v1/namespaces")
    
    if echo "$API_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ API access denied for $username${NC}"
        echo "Response: $API_RESPONSE"
        return 1
    fi
    
    echo -e "${GREEN}✅ API access granted for $username${NC}"
    
    # Decode JWT token to check claims
    echo "Checking JWT claims..."
    JWT_PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null || echo "{}")
    
    echo "JWT Claims:"
    echo "$JWT_PAYLOAD" | jq '.' 2>/dev/null || echo "Could not parse JWT payload"
    
    echo ""
}

# Test different users
echo -e "${YELLOW}🔐 Testing Authorization...${NC}"

# Test admin user
test_user_access "admin@ril.com" "admin123" "*" "*"

# Test limited user  
test_user_access "limited@temporal.local" "limited123" "default,jio-herald-plt" "workflow.read,workflow.signal"

# Test readonly user
test_user_access "readonly@temporal.local" "readonly123" "default" "workflow.read"

echo -e "${GREEN}🎉 Authorization testing completed!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Start Temporal UI: ./scripts/start-local.sh"
echo "2. Login with different users in the browser"
echo "3. Verify namespace and permission restrictions"
echo "4. Check workflow action controls"
