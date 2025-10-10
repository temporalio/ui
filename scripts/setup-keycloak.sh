#!/bin/bash

# Keycloak Setup Script for Temporal UI
# This script helps you set up Keycloak for Temporal UI authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Keycloak Setup for Temporal UI${NC}"
echo "=================================="

# Check if kcadm.sh is available
if ! command -v kcadm.sh &> /dev/null; then
    echo -e "${YELLOW}⚠️  kcadm.sh not found. You'll need to run these commands manually in Keycloak Admin Console.${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Setup Steps:${NC}"
    echo "1. Go to Keycloak Admin Console"
    echo "2. Create a new realm: 'temporal-ui'"
    echo "3. Create a client: 'temporal-ui'"
    echo "4. Configure redirect URIs"
    echo "5. Get client credentials"
    echo ""
    echo -e "${YELLOW}💡 See KEYCLOAK_SETUP.md for detailed instructions${NC}"
    exit 0
fi

# Configuration
REALM_NAME=${REALM_NAME:-"temporal-ui"}
CLIENT_ID=${CLIENT_ID:-"temporal-ui"}
CLIENT_SECRET=${CLIENT_SECRET:-""}
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
ADMIN_USER=${ADMIN_USER:-"admin"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-""}
CALLBACK_URL=${CALLBACK_URL:-"http://localhost:8080/auth/sso/callback"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Callback URL: $CALLBACK_URL"
echo ""

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
if [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${RED}❌ ADMIN_PASSWORD not set. Please set it:${NC}"
    echo "export ADMIN_PASSWORD='your-admin-password'"
    exit 1
fi

kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Create realm
echo -e "${YELLOW}🏗️  Creating realm: $REALM_NAME${NC}"
kcadm.sh create realms -s realm=$REALM_NAME -s enabled=true -s displayName="Temporal UI"

# Create client
echo -e "${YELLOW}🔧 Creating client: $CLIENT_ID${NC}"
kcadm.sh create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s enabled=true -s clientProtocol=openid-connect -s publicClient=false -s standardFlowEnabled=true -s implicitFlowEnabled=false -s directAccessGrantsEnabled=false -s serviceAccountsEnabled=false -s authorizationServicesEnabled=false

# Get client UUID
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -A1 $CLIENT_ID | grep id | cut -d'"' -f4)

# Configure client settings
echo -e "${YELLOW}⚙️  Configuring client settings...${NC}"
kcadm.sh update clients/$CLIENT_UUID -r $REALM_NAME -s 'redirectUris=["'$CALLBACK_URL'"]' -s 'webOrigins=["http://localhost:8080","https://localhost:8080"]'

# Get client secret
echo -e "${YELLOW}🔑 Getting client secret...${NC}"
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME --fields value | grep value | cut -d'"' -f4)

# Create admin user
echo -e "${YELLOW}👤 Creating admin user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=admin -s email=admin@temporal.local -s firstName=Admin -s lastName=User -s enabled=true

# Set admin password
ADMIN_USER_PASSWORD=${ADMIN_USER_PASSWORD:-"admin123"}
kcadm.sh set-password -r $REALM_NAME --username admin --new-password $ADMIN_USER_PASSWORD

# Create regular user
echo -e "${YELLOW}👤 Creating regular user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=user -s email=user@temporal.local -s firstName=Regular -s lastName=User -s enabled=true

# Set user password
USER_PASSWORD=${USER_PASSWORD:-"user123"}
kcadm.sh set-password -r $REALM_NAME --username user --new-password $USER_PASSWORD

echo ""
echo -e "${GREEN}✅ Keycloak setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Admin User: admin / $ADMIN_USER_PASSWORD"
echo "   Regular User: user / $USER_PASSWORD"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Callback URL: $CALLBACK_URL"
echo ""

echo -e "${BLUE}🔧 Temporal UI Configuration:${NC}"
echo "export TEMPORAL_ADDRESS=\"your-temporal-server:7233\""
echo "export AUTH_ENABLED=\"true\""
echo "export AUTH_PROVIDER_URL=\"$KEYCLOAK_URL/realms/$REALM_NAME\""
echo "export AUTH_CLIENT_ID=\"$CLIENT_ID\""
echo "export AUTH_CLIENT_SECRET=\"$CLIENT_SECRET\""
echo "export AUTH_CALLBACK_URL=\"$CALLBACK_URL\""
echo "export AUTH_SCOPES=\"openid,profile,email\""
echo "export AUTH_LABEL=\"Sign in with Keycloak\""
echo ""

echo -e "${YELLOW}🧪 Testing:${NC}"
echo "1. Start your Temporal UI with the above configuration"
echo "2. Navigate to the UI URL"
echo "3. Click 'Sign in with Keycloak'"
echo "4. Login with admin/admin123 or user/user123"
echo "5. You should be redirected back to Temporal UI"
echo ""

echo -e "${GREEN}🎉 Setup complete! Your Keycloak is ready for Temporal UI authentication.${NC}"
