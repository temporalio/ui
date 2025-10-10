#!/bin/bash

# Configure Temporal Authorization in Keycloak
# This script sets up namespace-level access control and user-level permissions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Configuring Temporal Authorization${NC}"
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
echo -e "${YELLOW}🔍 Getting client UUID...${NC}"
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME --fields id,clientId | jq -r ".[] | select(.clientId == \"$CLIENT_ID\") | .id")

if [ -z "$CLIENT_UUID" ]; then
    echo -e "${RED}❌ Client $CLIENT_ID not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found client UUID: $CLIENT_UUID${NC}"

# Create Temporal Claim Mapper
echo -e "${YELLOW}🔧 Creating Temporal Claim Mapper...${NC}"
kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r $REALM_NAME -s name="Temporal Claims Mapper" -s protocol="openid-connect" -s protocolMapper="oidc-usermodel-attribute-mapper" -s 'config."user.attribute"=temporal.namespaces' -s 'config."claim.name"=temporal_namespaces' -s 'config."jsonType.label"=String' -s 'config."id.token.claim"=true' -s 'config."access.token.claim"=true' -s 'config."userinfo.token.claim"=true'

# Create permissions mapper
kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r $REALM_NAME -s name="Temporal Permissions Mapper" -s protocol="openid-connect" -s protocolMapper="oidc-usermodel-attribute-mapper" -s 'config."user.attribute"=temporal.permissions' -s 'config."claim.name"=temporal_permissions' -s 'config."jsonType.label"=String' -s 'config."id.token.claim"=true' -s 'config."access.token.claim"=true' -s 'config."userinfo.token.claim"=true'

# Create workflow actions mapper
kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r $REALM_NAME -s name="Temporal Workflow Actions Mapper" -s protocol="openid-connect" -s protocolMapper="oidc-usermodel-attribute-mapper" -s 'config."user.attribute"=temporal.workflow.actions' -s 'config."claim.name"=temporal_workflow_actions' -s 'config."jsonType.label"=String' -s 'config."id.token.claim"=true' -s 'config."access.token.claim"=true' -s 'config."userinfo.token.claim"=true'

echo -e "${GREEN}✅ Claim mappers created successfully!${NC}"

# Configure users with different access levels
echo -e "${YELLOW}👥 Configuring user access levels...${NC}"

# Admin user - full access
echo -e "${YELLOW}🔧 Configuring admin user...${NC}"
ADMIN_USER_ID=$(kcadm.sh get users -r $REALM_NAME --fields id,username | grep -A1 "admin@temporal.local" | grep id | cut -d'"' -f4)
if [ ! -z "$ADMIN_USER_ID" ]; then
    kcadm.sh update users/$ADMIN_USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["*"]' -s 'attributes.temporal.permissions=["*"]' -s 'attributes.temporal.workflow.actions=["*"]'
    echo -e "${GREEN}✅ Admin user configured with full access${NC}"
fi

# Read-only user
echo -e "${YELLOW}🔧 Configuring read-only user...${NC}"
READONLY_USER_ID=$(kcadm.sh get users -r $REALM_NAME --fields id,username | grep -A1 "admin@ril.com" | grep id | cut -d'"' -f4)
if [ ! -z "$READONLY_USER_ID" ]; then
    kcadm.sh update users/$READONLY_USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["default"]' -s 'attributes.temporal.permissions=["workflow.read"]' -s 'attributes.temporal.workflow.actions=[]'
    echo -e "${GREEN}✅ Read-only user configured${NC}"
fi

# Create a limited user for testing
echo -e "${YELLOW}🔧 Creating limited user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=limited -s email=limited@temporal.local -s firstName=Limited -s lastName=User -s enabled=true
kcadm.sh set-password -r $REALM_NAME --username limited --new-password limited123

LIMITED_USER_ID=$(kcadm.sh get users -r $REALM_NAME --fields id,username | grep -A1 "limited@temporal.local" | grep id | cut -d'"' -f4)
if [ ! -z "$LIMITED_USER_ID" ]; then
    kcadm.sh update users/$LIMITED_USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["default","production"]' -s 'attributes.temporal.permissions=["workflow.read","workflow.signal"]' -s 'attributes.temporal.workflow.actions=["signal"]'
    echo -e "${GREEN}✅ Limited user configured${NC}"
fi

echo ""
echo -e "${GREEN}✅ Temporal authorization configured successfully!${NC}"
echo ""
echo -e "${BLUE}📋 User Access Levels:${NC}"
echo "   Admin User (admin@temporal.local):"
echo "     - Namespaces: * (all)"
echo "     - Permissions: * (all)"
echo "     - Workflow Actions: * (all)"
echo ""
echo "   Read-only User (admin@ril.com):"
echo "     - Namespaces: default"
echo "     - Permissions: workflow.read"
echo "     - Workflow Actions: none"
echo ""
echo "   Limited User (limited@temporal.local):"
echo "     - Namespaces: default, production"
echo "     - Permissions: workflow.read, workflow.signal"
echo "     - Workflow Actions: signal"
echo ""
echo -e "${YELLOW}🧪 Test the authorization:${NC}"
echo "1. Login with different users to see different access levels"
echo "2. Check the JWT token for temporal_* claims"
echo "3. Verify namespace and permission restrictions"
echo ""
echo -e "${GREEN}🎉 Granular authorization is now configured!${NC}"
