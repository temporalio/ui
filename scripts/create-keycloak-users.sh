#!/bin/bash

# Create Users in Keycloak for Temporal UI
# This script creates users in the temporal-ui realm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}👥 Creating Users in Keycloak${NC}"
echo "=================================="

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
REALM_NAME=${REALM_NAME:-"temporal-ui"}
ADMIN_USER=${ADMIN_USER:-"admin"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin@123"}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo "   Realm: $REALM_NAME"
echo "   Admin User: $ADMIN_USER"
echo ""

# Check if kcadm.sh is available
if ! command -v kcadm.sh &> /dev/null; then
    echo -e "${YELLOW}⚠️  kcadm.sh not found. You'll need to create users manually in Keycloak Admin Console.${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Steps:${NC}"
    echo "1. Go to Keycloak Admin Console: $KEYCLOAK_URL/admin"
    echo "2. Login with admin credentials"
    echo "3. Select realm: $REALM_NAME"
    echo "4. Go to Users → Add user"
    echo "5. Create users with these details:"
    echo ""
    echo -e "${GREEN}👤 User 1:${NC}"
    echo "   Username: admin"
    echo "   Email: admin@temporal.local"
    echo "   First Name: Admin"
    echo "   Last Name: User"
    echo "   Password: admin123"
    echo ""
    echo -e "${GREEN}👤 User 2:${NC}"
    echo "   Username: user"
    echo "   Email: user@temporal.local"
    echo "   First Name: Regular"
    echo "   Last Name: User"
    echo "   Password: user123"
    echo ""
    echo -e "${YELLOW}💡 After creating users, make sure to:${NC}"
    echo "   - Set passwords in the Credentials tab"
    echo "   - Enable the users"
    echo "   - Verify email if needed"
    exit 0
fi

# Login to Keycloak
echo -e "${YELLOW}🔑 Logging into Keycloak...${NC}"
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

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
echo -e "${GREEN}✅ Users created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 User Credentials:${NC}"
echo "   Admin User: admin / admin123"
echo "   Regular User: user / user123"
echo ""
echo -e "${YELLOW}🧪 Testing:${NC}"
echo "1. Go to your Temporal UI: http://localhost:8088"
echo "2. Click 'Sign in with Keycloak'"
echo "3. Login with admin/admin123 or user/user123"
echo "4. You should be redirected back to Temporal UI"
echo ""
echo -e "${GREEN}🎉 Users are ready for authentication!${NC}"
