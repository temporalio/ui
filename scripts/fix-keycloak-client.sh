#!/bin/bash

# Fix Keycloak Client Configuration for Temporal UI
# This script sets up the temporal-ui client in the temporal-ui realm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Fixing Keycloak Client Configuration${NC}"
echo "============================================="

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
CLIENT_ID=${CLIENT_ID:-"temporal-ui"}
ADMIN_USER=${ADMIN_USER:-"admin"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}
CALLBACK_URL=${CALLBACK_URL:-"http://localhost:8088/auth/sso/callback"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Callback URL: $CALLBACK_URL"
echo ""

# Check if kcadm.sh is available
if ! command -v kcadm.sh &> /dev/null; then
    echo -e "${YELLOW}⚠️  kcadm.sh not found. You'll need to configure the client manually.${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Steps:${NC}"
    echo "1. Go to Keycloak Admin Console: $KEYCLOAK_URL/admin"
    echo "2. Login with admin credentials"
    echo "3. Select realm: $REALM_NAME"
    echo "4. Go to Clients → Create"
    echo "5. Configure client:"
    echo "   - Client ID: $CLIENT_ID"
    echo "   - Client Protocol: openid-connect"
    echo "   - Root URL: http://localhost:8088"
    echo "6. Save and configure:"
    echo "   - Access Type: confidential"
    echo "   - Standard Flow Enabled: ON"
    echo "   - Valid Redirect URIs: $CALLBACK_URL"
    echo "   - Web Origins: http://localhost:8088"
    echo "7. Get client secret from Credentials tab"
    echo ""
    echo -e "${YELLOW}💡 After setup, update your configuration with the real client secret${NC}"
    exit 0
fi

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Check if client exists
echo -e "${YELLOW}🔍 Checking if client exists...${NC}"
if kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -q $CLIENT_ID; then
    echo -e "${GREEN}✅ Client $CLIENT_ID already exists${NC}"
else
    echo -e "${YELLOW}🔧 Creating client: $CLIENT_ID${NC}"
    kcadm.sh create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s enabled=true -s protocol=openid-connect -s publicClient=false -s standardFlowEnabled=true -s implicitFlowEnabled=false -s directAccessGrantsEnabled=false -s serviceAccountsEnabled=false -s authorizationServicesEnabled=false
fi

# Get client UUID
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -A1 $CLIENT_ID | grep id | cut -d'"' -f4)

# Configure client settings
echo -e "${YELLOW}⚙️  Configuring client settings...${NC}"
kcadm.sh update clients/$CLIENT_UUID -r $REALM_NAME -s 'redirectUris=["'$CALLBACK_URL'"]' -s 'webOrigins=["http://localhost:8088","http://localhost:8080"]'

# Get client secret
echo -e "${YELLOW}🔑 Getting client secret...${NC}"
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME --fields value | grep value | cut -d'"' -f4)

echo ""
echo -e "${GREEN}✅ Client configuration completed!${NC}"
echo ""
echo -e "${BLUE}📋 Client Details:${NC}"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Callback URL: $CALLBACK_URL"
echo ""
echo -e "${YELLOW}🔧 Update your configuration:${NC}"
echo "Update server/config/local.yaml with the real client secret:"
echo "clientSecret: \"$CLIENT_SECRET\""
echo ""
echo -e "${GREEN}🎉 Client is ready for authentication!${NC}"
