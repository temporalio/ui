#!/bin/bash

# Manage Temporal Users with Granular Permissions
# This script helps create and manage users with different access levels

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to create user with specific permissions
create_user_with_permissions() {
    local username=$1
    local email=$2
    local first_name=$3
    local last_name=$4
    local password=$5
    local namespaces=$6
    local permissions=$7
    local workflow_actions=$8
    
    echo -e "${YELLOW}👤 Creating user: $username${NC}"
    
    # Create user
    kcadm.sh create users -r $REALM_NAME -s username=$username -s email=$email -s firstName=$first_name -s lastName=$last_name -s enabled=true
    
    # Set password
    kcadm.sh set-password -r $REALM_NAME --username $username --new-password $password
    
    # Get user ID
    local user_id=$(kcadm.sh get users -r $REALM_NAME --fields id,username | grep -A1 "$email" | grep id | cut -d'"' -f4)
    
    if [ ! -z "$user_id" ]; then
        # Set user attributes
        kcadm.sh update users/$user_id -r $REALM_NAME \
            -s "attributes.temporal.namespaces=[$namespaces]" \
            -s "attributes.temporal.permissions=[$permissions]" \
            -s "attributes.temporal.workflow.actions=[$workflow_actions]"
        
        echo -e "${GREEN}✅ User $username created with permissions${NC}"
        echo "   Namespaces: $namespaces"
        echo "   Permissions: $permissions"
        echo "   Workflow Actions: $workflow_actions"
    else
        echo -e "${RED}❌ Failed to create user $username${NC}"
    fi
}

# Function to update user permissions
update_user_permissions() {
    local username=$1
    local namespaces=$2
    local permissions=$3
    local workflow_actions=$4
    
    echo -e "${YELLOW}🔧 Updating permissions for user: $username${NC}"
    
    # Get user ID
    local user_id=$(kcadm.sh get users -r $REALM_NAME --fields id,username | grep -A1 "$username" | grep id | cut -d'"' -f4)
    
    if [ ! -z "$user_id" ]; then
        # Update user attributes
        kcadm.sh update users/$user_id -r $REALM_NAME \
            -s "attributes.temporal.namespaces=[$namespaces]" \
            -s "attributes.temporal.permissions=[$permissions]" \
            -s "attributes.temporal.workflow.actions=[$workflow_actions]"
        
        echo -e "${GREEN}✅ User $username permissions updated${NC}"
    else
        echo -e "${RED}❌ User $username not found${NC}"
    fi
}

# Function to list users and their permissions
list_users() {
    echo -e "${BLUE}📋 Current Users and Permissions:${NC}"
    echo "=================================="
    
    kcadm.sh get users -r $REALM_NAME --fields id,username,attributes | jq -r '.[] | select(.attributes."temporal.namespaces") | "\(.username): \(.attributes."temporal.namespaces"[] // "none") | \(.attributes."temporal.permissions"[] // "none") | \(.attributes."temporal.workflow.actions"[] // "none")"'
}

# Main menu
case "${1:-menu}" in
    "create-admin")
        create_user_with_permissions "admin" "admin@temporal.local" "Admin" "User" "admin123" '"*"' '"*"' '"*"'
        ;;
    "create-readonly")
        create_user_with_permissions "readonly" "readonly@temporal.local" "ReadOnly" "User" "readonly123" '"default"' '"workflow.read"' '""'
        ;;
    "create-developer")
        create_user_with_permissions "developer" "developer@temporal.local" "Developer" "User" "dev123" '"default","development","staging"' '"workflow.read","workflow.start","workflow.signal"' '"start","signal"'
        ;;
    "create-limited")
        create_user_with_permissions "limited" "limited@temporal.local" "Limited" "User" "limited123" '"default","production"' '"workflow.read","workflow.signal"' '"signal"'
        ;;
    "update")
        if [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
            echo -e "${RED}❌ Usage: $0 update <username> <namespaces> <permissions> <workflow_actions>${NC}"
            echo "Example: $0 update admin '\"*\"' '\"*\"' '\"*\"'"
            exit 1
        fi
        update_user_permissions "$2" "$3" "$4" "$5"
        ;;
    "list")
        list_users
        ;;
    "menu"|*)
        echo -e "${GREEN}🔐 Temporal User Management${NC}"
        echo "=========================="
        echo ""
        echo -e "${BLUE}Available commands:${NC}"
        echo "  $0 create-admin          - Create admin user (full access)"
        echo "  $0 create-readonly       - Create read-only user"
        echo "  $0 create-developer       - Create developer user"
        echo "  $0 create-limited         - Create limited user"
        echo "  $0 update <user> <ns> <perm> <actions> - Update user permissions"
        echo "  $0 list                   - List all users and permissions"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo "  $0 create-admin"
        echo "  $0 update admin '\"*\"' '\"*\"' '\"*\"'"
        echo "  $0 list"
        ;;
esac
