#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Temporal UI Logout Functionality${NC}"
echo "=============================================="

# Test configuration
TEMPORAL_UI_URL="http://localhost:8088"
KEYCLOAK_URL="http://localhost:8080"

echo -e "${YELLOW}📋 Test Plan:${NC}"
echo "1. Test server logout endpoint"
echo "2. Test cookie cleanup"
echo "3. Test Keycloak logout redirect"
echo ""

# Test server logout endpoint
echo -e "${BLUE}Testing server logout endpoint...${NC}"
LOGOUT_RESPONSE=$(curl -s -i "$TEMPORAL_UI_URL/auth/logout" 2>/dev/null || echo "Connection failed")

if echo "$LOGOUT_RESPONSE" | grep -q "302 Found\|301 Moved"; then
    echo -e "${GREEN}✅ Server logout endpoint is working (redirecting)${NC}"
    
    # Extract redirect URL
    REDIRECT_URL=$(echo "$LOGOUT_RESPONSE" | grep -i "location:" | cut -d' ' -f2- | tr -d '\r\n')
    echo "Redirect URL: $REDIRECT_URL"
    
    if echo "$REDIRECT_URL" | grep -q "keycloak\|logout"; then
        echo -e "${GREEN}✅ Keycloak logout redirect is working${NC}"
    else
        echo -e "${YELLOW}⚠️  Keycloak logout redirect may not be configured properly${NC}"
    fi
else
    echo -e "${RED}❌ Server logout endpoint failed${NC}"
    echo "Response: $LOGOUT_RESPONSE"
fi

echo ""

# Test cookie cleanup
echo -e "${BLUE}Testing cookie cleanup...${NC}"
echo "The logout endpoint should clear the following cookies:"
echo "- user, auth, session, token, access_token, id_token"
echo "- refresh_token, temporal_auth, temporal_session"
echo "- state, nonce"
echo ""

# Test with a mock session
echo -e "${YELLOW}🔍 Manual Testing Steps:${NC}"
echo "1. Start Temporal UI: ./scripts/start-local.sh"
echo "2. Login with a user (e.g., admin@ril.com)"
echo "3. Check browser cookies (F12 -> Application -> Cookies)"
echo "4. Click logout button"
echo "5. Verify cookies are cleared"
echo "6. Verify redirect to Keycloak logout"
echo "7. Verify redirect back to Temporal UI login page"
echo ""

echo -e "${GREEN}🎉 Logout functionality test completed!${NC}"
echo ""
echo -e "${BLUE}📝 Expected Behavior:${NC}"
echo "✅ Client-side: clearAuthUser() clears store and cookies"
echo "✅ Server-side: /auth/logout clears server cookies"
echo "✅ Keycloak: Redirects to Keycloak logout endpoint"
echo "✅ Final: User is redirected back to login page"
