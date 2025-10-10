#!/bin/bash

# Setup User Permissions for Temporal UI
# This script configures users with different access levels

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}👥 Setting up User Permissions${NC}"
echo "==============================="

# Add Keycloak bin directory to PATH
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
ADMIN_USER=${ADMIN_USER:-"sagar"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Function to update user attributes
update_user_attributes() {
    local user_email=$1
    local namespaces=$2
    local permissions=$3
    local workflow_actions=$4
    
    echo -e "${YELLOW}🔧 Configuring user: $user_email${NC}"
    
    # Get user ID by email
    local user_id=$(kcadm.sh get users -r $REALM_NAME --fields id,email | jq -r ".[] | select(.email == \"$user_email\") | .id")
    
    if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
        # Update user attributes
        kcadm.sh update users/$user_id -r $REALM_NAME \
            -s "attributes.temporal.namespaces=[$namespaces]" \
            -s "attributes.temporal.permissions=[$permissions]" \
            -s "attributes.temporal.workflow.actions=[$workflow_actions]"
        
        echo -e "${GREEN}✅ User $user_email configured${NC}"
        echo "   Namespaces: $namespaces"
        echo "   Permissions: $permissions"
        echo "   Workflow Actions: $workflow_actions"
    else
        echo -e "${RED}❌ User $user_email not found${NC}"
    fi
}

# Configure existing users
echo -e "${YELLOW}👤 Configuring existing users...${NC}"

# Admin user - full access
update_user_attributes "admin@temporal.local" '"*"' '"*"' '"*"'

# Read-only user
update_user_attributes "admin@ril.com" '"default"' '"workflow.read"' '""'

# Create and configure a limited user
echo -e "${YELLOW}👤 Creating limited user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=limited -s email=limited@temporal.local -s firstName=Limited -s lastName=User -s enabled=true
kcadm.sh set-password -r $REALM_NAME --username limited --new-password limited123

# Configure limited user
update_user_attributes "limited@temporal.local" '"default","production"' '"workflow.read","workflow.signal"' '"signal"'

# Create and configure a developer user
echo -e "${YELLOW}👤 Creating developer user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=developer -s email=developer@temporal.local -s firstName=Developer -s lastName=User -s enabled=true
kcadm.sh set-password -r $REALM_NAME --username developer --new-password dev123

# Configure developer user
update_user_attributes "developer@temporal.local" '"default","development","staging"' '"workflow.read","workflow.start","workflow.signal"' '"start","signal"'

echo ""
echo -e "${GREEN}✅ User permissions configured successfully!${NC}"
echo ""
echo -e "${BLUE}📋 User Access Summary:${NC}"
echo "=================================="
echo ""
echo -e "${GREEN}🔑 Admin User (admin@temporal.local):${NC}"
echo "   Password: admin123"
echo "   Namespaces: * (all)"
echo "   Permissions: * (all)"
echo "   Workflow Actions: * (all)"
echo ""
echo -e "${YELLOW}👁️  Read-only User (admin@ril.com):${NC}"
echo "   Password: admin123"
echo "   Namespaces: default"
echo "   Permissions: workflow.read"
echo "   Workflow Actions: none"
echo ""
echo -e "${BLUE}🔧 Limited User (limited@temporal.local):${NC}"
echo "   Password: limited123"
echo "   Namespaces: default, production"
echo "   Permissions: workflow.read, workflow.signal"
echo "   Workflow Actions: signal"
echo ""
echo -e "${PURPLE}💻 Developer User (developer@temporal.local):${NC}"
echo "   Password: dev123"
echo "   Namespaces: default, development, staging"
echo "   Permissions: workflow.read, workflow.start, workflow.signal"
echo "   Workflow Actions: start, signal"
echo ""
echo -e "${YELLOW}🧪 Test the authorization:${NC}"
echo "1. Login with different users to see different access levels"
echo "2. Check the JWT token for temporal_* claims"
echo "3. Verify namespace and permission restrictions"
echo "4. Test workflow action controls"
echo ""
echo -e "${GREEN}🎉 Granular authorization is now configured!${NC}"
