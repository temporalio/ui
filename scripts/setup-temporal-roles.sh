#!/bin/bash

# Setup Temporal Roles in Keycloak
# This script creates roles and assigns them to users for better organization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎭 Setting up Temporal Roles${NC}"
echo "============================="

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

# Create Temporal Roles
echo -e "${YELLOW}🎭 Creating Temporal Roles...${NC}"

# Admin Role
echo -e "${YELLOW}🔧 Creating admin role...${NC}"
kcadm.sh create roles -r $REALM_NAME -s name=temporal-admin -s description="Temporal Admin - Full access to all namespaces and operations"

# Read-only Role
echo -e "${YELLOW}🔧 Creating read-only role...${NC}"
kcadm.sh create roles -r $REALM_NAME -s name=temporal-readonly -s description="Temporal Read-only - Can only view workflows in default namespace"

# Developer Role
echo -e "${YELLOW}🔧 Creating developer role...${NC}"
kcadm.sh create roles -r $REALM_NAME -s name=temporal-developer -s description="Temporal Developer - Can start and signal workflows in dev namespaces"

# Limited Role
echo -e "${YELLOW}🔧 Creating limited role...${NC}"
kcadm.sh create roles -r $REALM_NAME -s name=temporal-limited -s description="Temporal Limited - Can signal workflows in specific namespaces"

# Production Role
echo -e "${YELLOW}🔧 Creating production role...${NC}"
kcadm.sh create roles -r $REALM_NAME -s name=temporal-production -s description="Temporal Production - Can manage workflows in production namespace"

echo -e "${GREEN}✅ Roles created successfully!${NC}"

# Function to assign role to user
assign_role_to_user() {
    local user_email=$1
    local role_name=$2
    
    echo -e "${YELLOW}🔧 Assigning role $role_name to user $user_email...${NC}"
    
    # Get user ID
    local user_id=$(kcadm.sh get users -r $REALM_NAME --fields id,email | jq -r ".[] | select(.email == \"$user_email\") | .id")
    
    if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
        # Get role ID
        local role_id=$(kcadm.sh get roles -r $REALM_NAME --fields id,name | jq -r ".[] | select(.name == \"$role_name\") | .id")
        
        if [ ! -z "$role_id" ] && [ "$role_id" != "null" ]; then
            # Assign role to user
            kcadm.sh create users/$user_id/role-mappings/realm -r $REALM_NAME -s '[{"id":"'$role_id'","name":"'$role_name'"}]'
            echo -e "${GREEN}✅ Role $role_name assigned to $user_email${NC}"
        else
            echo -e "${RED}❌ Role $role_name not found${NC}"
        fi
    else
        echo -e "${RED}❌ User $user_email not found${NC}"
    fi
}

# Assign roles to users
echo -e "${YELLOW}👥 Assigning roles to users...${NC}"

# Admin user gets admin role
assign_role_to_user "admin@temporal.local" "temporal-admin"

# Read-only user gets read-only role
assign_role_to_user "admin@ril.com" "temporal-readonly"

# Limited user gets limited role
assign_role_to_user "limited@temporal.local" "temporal-limited"

# Developer user gets developer role
assign_role_to_user "developer@temporal.local" "temporal-developer"

# Create a production user
echo -e "${YELLOW}👤 Creating production user...${NC}"
kcadm.sh create users -r $REALM_NAME -s username=production -s email=production@temporal.local -s firstName=Production -s lastName=User -s enabled=true
kcadm.sh set-password -r $REALM_NAME --username production --new-password prod123

# Assign production role
assign_role_to_user "production@temporal.local" "temporal-production"

# Configure production user attributes
echo -e "${YELLOW}🔧 Configuring production user attributes...${NC}"
PROD_USER_ID=$(kcadm.sh get users -r $REALM_NAME --fields id,email | jq -r ".[] | select(.email == \"production@temporal.local\") | .id")
if [ ! -z "$PROD_USER_ID" ] && [ "$PROD_USER_ID" != "null" ]; then
    kcadm.sh update users/$PROD_USER_ID -r $REALM_NAME \
        -s "attributes.temporal.namespaces=[\"production\"]" \
        -s "attributes.temporal.permissions=[\"workflow.read\",\"workflow.start\",\"workflow.terminate\"]" \
        -s "attributes.temporal.workflow.actions=[\"start\",\"terminate\"]"
    echo -e "${GREEN}✅ Production user configured${NC}"
fi

echo ""
echo -e "${GREEN}✅ Temporal roles setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Role Summary:${NC}"
echo "=================="
echo ""
echo -e "${GREEN}🎭 Available Roles:${NC}"
echo "   temporal-admin      - Full access to all namespaces and operations"
echo "   temporal-readonly   - Can only view workflows in default namespace"
echo "   temporal-developer  - Can start and signal workflows in dev namespaces"
echo "   temporal-limited    - Can signal workflows in specific namespaces"
echo "   temporal-production - Can manage workflows in production namespace"
echo ""
echo -e "${BLUE}👥 User Role Assignments:${NC}"
echo "   admin@temporal.local     → temporal-admin"
echo "   admin@ril.com           → temporal-readonly"
echo "   limited@temporal.local   → temporal-limited"
echo "   developer@temporal.local → temporal-developer"
echo "   production@temporal.local → temporal-production"
echo ""
echo -e "${YELLOW}💡 Benefits of Roles:${NC}"
echo "   ✅ Better organization and management"
echo "   ✅ Easier to assign permissions to groups of users"
echo "   ✅ Role-based access control (RBAC)"
echo "   ✅ Can be combined with user attributes for fine-grained control"
echo ""
echo -e "${GREEN}🎉 Both user attributes AND roles are now configured!${NC}"
