#!/bin/bash

# Check Keycloak Credentials
# This script helps you find the correct admin credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Checking Keycloak Credentials${NC}"
echo "=================================="

# Add Keycloak bin directory to PATH
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin

KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}

echo -e "${BLUE}📋 Keycloak Information:${NC}"
echo "   Keycloak URL: $KEYCLOAK_URL"
echo ""

# Check if Keycloak is running
echo -e "${YELLOW}🔍 Checking if Keycloak is running...${NC}"
if curl -s $KEYCLOAK_URL > /dev/null; then
    echo -e "${GREEN}✅ Keycloak is running${NC}"
else
    echo -e "${RED}❌ Keycloak is not running${NC}"
    echo "Please start Keycloak first"
    exit 1
fi

# Check if kcadm.sh is available
echo -e "${YELLOW}🔍 Checking if kcadm.sh is available...${NC}"
if command -v kcadm.sh &> /dev/null; then
    echo -e "${GREEN}✅ kcadm.sh is available${NC}"
else
    echo -e "${RED}❌ kcadm.sh not found${NC}"
    echo "Please check the Keycloak installation path"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Common Admin Credentials:${NC}"
echo "   Username: admin"
echo "   Password options:"
echo "     - admin123"
echo "     - admin@123"
echo "     - admin"
echo "     - password"
echo "     - (check your Keycloak startup logs)"
echo ""

echo -e "${YELLOW}🧪 Testing credentials...${NC}"

# Test different common passwords
PASSWORDS=("admin123" "admin@123" "admin" "password" "keycloak")

for password in "${PASSWORDS[@]}"; do
    echo -e "${YELLOW}Testing: admin / $password${NC}"
    if echo "$password" | kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user admin --password "$password" 2>/dev/null; then
        echo -e "${GREEN}✅ Success! Admin credentials: admin / $password${NC}"
        echo ""
        echo -e "${BLUE}📋 You can now run:${NC}"
        echo "export ADMIN_PASSWORD=\"$password\""
        echo "./scripts/setup-keycloak-simple.sh"
        exit 0
    else
        echo -e "${RED}❌ Failed: admin / $password${NC}"
    fi
done

echo ""
echo -e "${RED}❌ None of the common passwords worked${NC}"
echo ""
echo -e "${YELLOW}💡 Manual Steps:${NC}"
echo "1. Go to Keycloak Admin Console: $KEYCLOAK_URL/admin"
echo "2. Try to login with different credentials"
echo "3. Check your Keycloak startup logs for the admin password"
echo "4. Or reset the admin password if needed"
echo ""
echo -e "${BLUE}📋 To reset admin password:${NC}"
echo "1. Stop Keycloak"
echo "2. Start with: ./kcadm.sh start-dev --admin-password=admin123"
echo "3. Or check your Keycloak startup logs for the generated password"
