#!/bin/bash

# Create Keycloak Client for Temporal UI
# This script creates the temporal-ui client in the temporal-ui realm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Creating Keycloak Client for Temporal UI${NC}"
echo "============================================="

# Add Keycloak bin directory to PATH
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
CLIENT_ID=${CLIENT_ID:-"temporal-ui"}
ADMIN_USER=${ADMIN_USER:-"sagar"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}
CALLBACK_URL=${CALLBACK_URL:-"http://localhost:8088/auth/sso/callback"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Callback URL: $CALLBACK_URL"
echo ""

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Create client
echo -e "${YELLOW}🔧 Creating client: $CLIENT_ID${NC}"
kcadm.sh create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s enabled=true -s protocol=openid-connect -s publicClient=false -s standardFlowEnabled=true -s implicitFlowEnabled=false -s directAccessGrantsEnabled=false -s serviceAccountsEnabled=false -s authorizationServicesEnabled=false

echo -e "${GREEN}✅ Client $CLIENT_ID created successfully!${NC}"

# Get client UUID
echo -e "${YELLOW}🔍 Getting client UUID...${NC}"
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -A1 $CLIENT_ID | grep id | cut -d'"' -f4)

echo -e "${GREEN}✅ Client UUID: $CLIENT_UUID${NC}"

# Get client secret
echo -e "${YELLOW}🔑 Getting client secret...${NC}"
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME --fields value | grep value | cut -d'"' -f4)

echo ""
echo -e "${GREEN}✅ Client setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Client Details:${NC}"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Realm: $REALM_NAME"
echo "   Callback URL: $CALLBACK_URL"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Update server/config/local.yaml with the client secret:"
echo "   clientSecret: \"$CLIENT_SECRET\""
echo ""
echo "2. Configure redirect URIs in Keycloak Admin Console:"
echo "   - Go to Clients → temporal-ui → Settings"
echo "   - Add to Valid Redirect URIs: $CALLBACK_URL"
echo "   - Add to Web Origins: http://localhost:8088"
echo ""
echo "3. Create users in the realm"
echo ""
echo -e "${GREEN}🎉 Client is ready for authentication!${NC}"
