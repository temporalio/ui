#!/bin/bash

# Simple Keycloak Setup for Temporal UI
# This script sets up the realm, client, and users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Simple Keycloak Setup for Temporal UI${NC}"
echo "============================================="

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
CLIENT_ID=${CLIENT_ID:-"temporal-ui"}
ADMIN_USER=${ete :-"sagar"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}
CALLBACK_URL=${CALLBACK_URL:-"http://localhost:8088/auth/sso/callback"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Callback URL: $CALLBACK_URL"
echo ""

# Add Keycloak bin directory to PATH
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin

# Check if kcadm.sh is available
if ! command -v kcadm.sh &> /dev/null; then
    echo -e "${YELLOW}⚠️  kcadm.sh not found. Manual setup required.${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Setup Steps:${NC}"
    echo "1. Go to Keycloak Admin Console: $KEYCLOAK_URL/admin"
    echo "2. Login with: admin / $ADMIN_PASSWORD"
    echo "3. Create realm: $REALM_NAME"
    echo "4. Create client: $CLIENT_ID"
    echo "5. Create users: admin, user"
    echo ""
    echo -e "${YELLOW}💡 See KEYCLOAK_MANUAL_SETUP.md for detailed steps${NC}"
    exit 0
fi

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Create realm (if not exists)
echo -e "${YELLOW}🏗️  Creating realm: $REALM_NAME${NC}"
if kcadm.sh get realms/$REALM_NAME 2>/dev/null; then
    echo -e "${GREEN}✅ Realm $REALM_NAME already exists${NC}"
else
    kcadm.sh create realms -s realm=$REALM_NAME -s enabled=true -s displayName="Temporal UI"
    echo -e "${GREEN}✅ Realm $REALM_NAME created${NC}"
fi

# Create client (if not exists)
echo -e "${YELLOW}🔧 Creating client: $CLIENT_ID${NC}"
if kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -q $CLIENT_ID; then
    echo -e "${GREEN}✅ Client $CLIENT_ID already exists${NC}"
else
    kcadm.sh create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s enabled=true -s protocol=openid-connect -s publicClient=false -s standardFlowEnabled=true -s implicitFlowEnabled=false -s directAccessGrantsEnabled=false -s serviceAccountsEnabled=false -s authorizationServicesEnabled=false
    echo -e "${GREEN}✅ Client $CLIENT_ID created${NC}"
fi

# Get client UUID
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -A1 $CLIENT_ID | grep id | cut -d'"' -f4)

# Configure client settings
echo -e "${YELLOW}⚙️  Configuring client settings...${NC}"
kcadm.sh update clients/$CLIENT_UUID -r $REALM_NAME -s 'redirectUris=["'$CALLBACK_URL'","http://localhost:8080/auth/sso/callback"]' -s 'webOrigins=["http://localhost:8088","http://localhost:8080"]'

# Get client secret
echo -e "${YELLOW}🔑 Getting client secret...${NC}"
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME --fields value | grep value | cut -d'"' -f4)

# Create admin user
echo -e "${YELLOW}👤 Creating admin user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=admin -s email=admin@temporal.local -s firstName=Admin -s lastName=User -s enabled=true

# Set admin password
kcadm.sh set-password -r $REALM_NAME --username admin --new-password admin123

# Create regular user
echo -e "${YELLOW}👤 Creating regular user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=user -s email=user@temporal.local -s firstName=Regular -s lastName=User -s enabled=true

# Set user password
kcadm.sh set-password -r $REALM_NAME --username user --new-password user123

echo ""
echo -e "${GREEN}✅ Keycloak setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Callback URL: $CALLBACK_URL"
echo "   Admin User: admin / admin123"
echo "   Regular User: user / user123"
echo ""

echo -e "${YELLOW}🔧 Update your configuration:${NC}"
echo "Update server/config/local.yaml with the real client secret:"
echo "clientSecret: \"$CLIENT_SECRET\""
echo ""

echo -e "${GREEN}🎉 Setup complete! Your Keycloak is ready for Temporal UI authentication.${NC}"
