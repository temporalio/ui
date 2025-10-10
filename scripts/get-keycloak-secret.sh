#!/bin/bash

# Get Keycloak Client Secret
# This script gets the client secret for the temporal-ui client

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔑 Getting Keycloak Client Secret${NC}"
echo "====================================="

# Add Keycloak bin directory to PATH
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
CLIENT_ID=${CLIENT_ID:-"temporal-ui"}
ADMIN_USER=${ADMIN_USER:-"sagar"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo ""

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Get client UUID
echo -e "${YELLOW}🔍 Finding client UUID...${NC}"
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -A1 $CLIENT_ID | grep id | cut -d'"' -f4)

if [ -z "$CLIENT_UUID" ]; then
    echo -e "${RED}❌ Client $CLIENT_ID not found in realm $REALM_NAME${NC}"
    echo "Please create the client first in Keycloak Admin Console"
    exit 1
fi

echo -e "${GREEN}✅ Found client UUID: $CLIENT_UUID${NC}"

# Get client secret
echo -e "${YELLOW}🔑 Getting client secret...${NC}"
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME --fields value | grep value | cut -d'"' -f4)

if [ -z "$CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Could not get client secret${NC}"
    echo "Please check the client configuration in Keycloak Admin Console"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Client secret retrieved successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Client Details:${NC}"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Realm: $REALM_NAME"
echo ""
echo -e "${YELLOW}🔧 Update your configuration:${NC}"
echo "Update server/config/local.yaml with the real client secret:"
echo "clientSecret: \"$CLIENT_SECRET\""
echo ""
echo -e "${GREEN}🎉 You can now test the authentication!${NC}"
