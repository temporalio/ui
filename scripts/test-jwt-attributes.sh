#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing JWT Attributes and Authorization${NC}"
echo "=============================================="

# Test configuration
KEYCLOAK_URL="http://localhost:8080"
TEMPORAL_UI_URL="http://localhost:8088"

echo -e "${YELLOW}📋 Test Plan:${NC}"
echo "1. Get JWT token from Keycloak for limited user"
echo "2. Decode JWT token and check for temporal attributes"
echo "3. Test API calls with JWT token"
echo "4. Verify namespace filtering"
echo ""

# Function to get JWT token
get_jwt_token() {
    local username=$1
    local password=$2
    
    echo -e "${BLUE}Getting JWT token for: $username${NC}"
    
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
    echo "$ACCESS_TOKEN"
}

# Function to decode JWT token
decode_jwt_token() {
    local token=$1
    
    echo -e "${BLUE}Decoding JWT token...${NC}"
    
    # Split JWT token into parts
    IFS='.' read -r header payload signature <<< "$token"
    
    # Decode payload (base64url)
    echo "JWT Header:"
    echo "$header" | base64 -d 2>/dev/null | jq '.' 2>/dev/null || echo "Could not decode header"
    
    echo ""
    echo "JWT Payload:"
    echo "$payload" | base64 -d 2>/dev/null | jq '.' 2>/dev/null || echo "Could not decode payload"
    
    echo ""
    echo "Temporal Attributes Check:"
    TEMPORAL_ATTRS=$(echo "$payload" | base64 -d 2>/dev/null | jq -r '.temporal_namespaces, .temporal_permissions, .temporal_workflow_actions' 2>/dev/null || echo "No temporal attributes found")
    echo "$TEMPORAL_ATTRS"
}

# Function to test API with JWT token
test_api_with_token() {
    local token=$1
    local namespace=$2
    
    echo -e "${BLUE}Testing API access for namespace: $namespace${NC}"
    
    API_RESPONSE=$(curl -s -H "Authorization: Bearer $token" \
        -H "X-Temporal-Namespace: $namespace" \
        "$TEMPORAL_UI_URL/api/v1/namespaces/$namespace/workflows?pageSize=10")
    
    if echo "$API_RESPONSE" | grep -q "error\|Forbidden\|Access denied"; then
        echo -e "${RED}❌ API access denied for namespace: $namespace${NC}"
        echo "Response: $API_RESPONSE"
        return 1
    else
        echo -e "${GREEN}✅ API access granted for namespace: $namespace${NC}"
        echo "Response length: $(echo "$API_RESPONSE" | wc -c) characters"
        return 0
    fi
}

# Test limited user
echo -e "${YELLOW}🔐 Testing Limited User...${NC}"
LIMITED_TOKEN=$(get_jwt_token "limited@temporal.local" "limited123")

if [ ! -z "$LIMITED_TOKEN" ]; then
    echo ""
    decode_jwt_token "$LIMITED_TOKEN"
    echo ""
    
    # Test API access for different namespaces
    echo -e "${YELLOW}Testing namespace access...${NC}"
    test_api_with_token "$LIMITED_TOKEN" "default"
    test_api_with_token "$LIMITED_TOKEN" "jio-herald-plt"
    test_api_with_token "$LIMITED_TOKEN" "production"
fi

echo ""
echo -e "${GREEN}🎉 JWT Attributes testing completed!${NC}"
echo ""
echo -e "${BLUE}📝 Expected Results:${NC}"
echo "✅ Limited user should have temporal attributes in JWT"
echo "✅ Limited user should access 'default' and 'jio-herald-plt' namespaces"
echo "❌ Limited user should be denied access to 'production' namespace"
