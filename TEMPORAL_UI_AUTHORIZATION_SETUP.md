# Temporal UI Authorization Setup Guide

This guide provides comprehensive instructions for setting up granular authorization in the Temporal UI using Keycloak, including namespace-level access control and workflow action permissions.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Keycloak Setup](#keycloak-setup)
4. [Temporal UI Configuration](#temporal-ui-configuration)
5. [User Management](#user-management)
6. [Testing Authorization](#testing-authorization)
7. [Troubleshooting](#troubleshooting)
8. [File Changes Summary](#file-changes-summary)

## Overview

This implementation provides:

- **Namespace-level Access Control**: Users can only access specific Temporal namespaces
- **Workflow Action Permissions**: Granular control over workflow actions (reset, terminate, signal, cancel)
- **Wildcard Support**: Admin users can have `*` permissions for full access
- **Dynamic UI Controls**: UI elements are dynamically enabled/disabled based on user permissions
- **Secure Logout**: Complete session cleanup on logout

## Prerequisites

- Keycloak 26.4.0+ running on `http://localhost:8080`
- Temporal UI server (Go-based)
- `kcadm.sh` CLI tool available in PATH
- `jq` command-line JSON processor

## Keycloak Setup

### 1. Start Keycloak

```bash
# Start Keycloak server
cd ~/Documents/office/tools/keycloak/keycloak-26.4.0
./bin/kc.sh start-dev --http-port=8080
```

### 2. Create Realm and Client

```bash
# Set up environment variables
export KEYCLOAK_URL="http://localhost:8080"
export REALM_NAME="temporal-ui"
export CLIENT_ID="temporal-ui"
export ADMIN_USER="sagar"
export ADMIN_PASSWORD="admin@123"

# Create realm
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh create realms -s realm=$REALM_NAME -s enabled=true

# Create client
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s enabled=true -s protocol=openid-connect -s publicClient=false -s directAccessGrantsEnabled=true -s serviceAccountsEnabled=true -s authorizationServicesEnabled=true -s 'redirectUris=["http://localhost:8088/auth/sso/callback"]' -s 'webOrigins=["http://localhost:8088"]' -s rootUrl="http://localhost:8088"
```

### 3. Get Client Secret

```bash
# Get client UUID
CLIENT_UUID=$(~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get clients -r $REALM_NAME | jq -r ".[] | select(.clientId == \"$CLIENT_ID\") | .id")

# Get client secret
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME | jq -r '.value'
```

### 4. Configure Client Settings

```bash
# Update client with additional settings
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh update clients/$CLIENT_UUID -r $REALM_NAME -s 'redirectUris=["http://localhost:8088/auth/sso/callback","http://localhost:8080/auth/sso/callback"]' -s 'webOrigins=["http://localhost:8088","http://localhost:8080"]' -s 'attributes.access.token.lifespan=3600'
```

## Temporal UI Configuration

### 1. Update Configuration Files

**server/config/local.yaml:**

```yaml
port: 8088
auth:
  enabled: true
  providers:
    - providerURL: http://localhost:8080/realms/temporal-ui
      clientID: temporal-ui
      clientSecret: 'YOUR_CLIENT_SECRET_HERE'
      callbackURL: http://localhost:8088/auth/sso/callback
      scopes: ['openid', 'profile', 'email']
  jwtSecret: 'your-jwt-secret-key-for-temporal-ui'
```

### 2. Build and Start Server

```bash
# Build the server
cd server
go build -o ui-server ./cmd/server

# Start the server
./ui-server --config ./config --env local start
```

## User Management

### 1. Create Users

```bash
# Create admin user
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh create users -r $REALM_NAME -s username=admin@temporal.local -s email=admin@temporal.local -s firstName=Admin -s lastName=User -s enabled=true

# Create limited user
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh create users -r $REALM_NAME -s username=limited@temporal.local -s email=limited@temporal.local -s firstName=Limited -s lastName=User -s enabled=true

# Create readonly user
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh create users -r $REALM_NAME -s username=readonly@temporal.local -s email=readonly@temporal.local -s firstName=ReadOnly -s lastName=User -s enabled=true
```

### 2. Set User Passwords

```bash
# Set passwords for all users
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh set-password -r $REALM_NAME --username admin@temporal.local --new-password admin123
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh set-password -r $REALM_NAME --username limited@temporal.local --new-password limited123
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh set-password -r $REALM_NAME --username readonly@temporal.local --new-password readonly123
```

### 3. Configure User Attributes

**Admin User (Full Access):**

```bash
# Get user ID
USER_ID=$(~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get users -r $REALM_NAME | jq -r ".[] | select(.username == \"admin@temporal.local\") | .id")

# Set attributes for wildcard access
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh update users/$USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["*"]' -s 'attributes.temporal.permissions=["*"]' -s 'attributes.temporal.workflow.actions=["*"]'
```

**Limited User (Specific Namespaces):**

```bash
# Get user ID
USER_ID=$(~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get users -r $REALM_NAME | jq -r ".[] | select(.username == \"limited@temporal.local\") | .id")

# Set attributes for limited access
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh update users/$USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["default","jio-herald-plt"]' -s 'attributes.temporal.permissions=["workflow.read","workflow.write","namespace.read"]' -s 'attributes.temporal.workflow.actions=["reset","terminate","signal","cancel"]'
```

**ReadOnly User (Read-only Access):**

```bash
# Get user ID
USER_ID=$(~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get users -r $REALM_NAME | jq -r ".[] | select(.username == \"readonly@temporal.local\") | .id")

# Set attributes for readonly access
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh update users/$USER_ID -r $REALM_NAME -s 'attributes.temporal.namespaces=["default"]' -s 'attributes.temporal.permissions=["workflow.read","namespace.read"]' -s 'attributes.temporal.workflow.actions=[]'
```

## Testing Authorization

### 1. Test Login Flow

1. Navigate to `http://localhost:8088`
2. Click "Login with SSO"
3. Login with different users:
   - `admin@temporal.local` / `admin123` (full access)
   - `limited@temporal.local` / `limited123` (limited access)
   - `readonly@temporal.local` / `readonly123` (read-only access)

### 2. Test Namespace Access

- **Admin**: Should see all namespaces
- **Limited**: Should see only `default` and `jio-herald-plt` namespaces
- **ReadOnly**: Should see only `default` namespace

### 3. Test Workflow Actions

- **Admin**: All workflow actions should be enabled
- **Limited**: Reset, terminate, signal, and cancel should be enabled
- **ReadOnly**: All workflow actions should be disabled

### 4. Test Logout

1. Click logout
2. Verify all cookies and session data are cleared
3. Verify auto-login is prevented

## Troubleshooting

### Common Issues

1. **"Authorization header required" error**
   - Check if auth is enabled in configuration
   - Verify JWT secret is set

2. **"Permission denied" errors**
   - Check user attributes in Keycloak
   - Verify JWT claims are correctly mapped

3. **Auto-login after logout**
   - Check if all cookies are being cleared
   - Verify Keycloak logout URL is correct

4. **Namespace filtering not working**
   - Check if temporal_namespaces attribute is set
   - Verify namespace names match exactly

### Debug Commands

```bash
# Check user attributes
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh get users -r $REALM_NAME | jq '.[] | select(.username == "admin@temporal.local") | .attributes'

# Test JWT token
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8088/api/v1/settings" | jq

# Check server logs
tail -f server.log
```

## File Changes Summary

### New Files Created

1. **server/server/temporal_auth/temporal_auth.go** - Core authorization logic
2. **server/server/temporal_auth/echo_middleware.go** - Echo middleware integration
3. **src/lib/utilities/namespace-filter.ts** - Namespace filtering utility
4. **keycloak-plugins/TemporalAuthorizer.java** - Keycloak authorization plugin
5. **keycloak-plugins/TemporalClaimMapper.java** - JWT claim mapping plugin
6. **keycloak-plugins/TemporalProvider.java** - Keycloak provider registration
7. **keycloak-plugins/TemporalAuthorizationProvider.java** - Authorization provider

### Modified Files

1. **server/config/local.yaml** - Added JWT secret configuration
2. **server/server/config/config.go** - Added JWTSecret field
3. **server/server/api/handler.go** - Integrated authorization middleware
4. **server/server/route/auth.go** - Enhanced logout functionality
5. **src/lib/types/global.ts** - Extended User type with temporal claims
6. **src/lib/stores/auth-user.ts** - Updated to handle temporal claims
7. **src/lib/services/namespaces-service.ts** - Added namespace filtering
8. **src/routes/(app)/+layout.svelte** - Enhanced logout with storage cleanup

### Scripts Created

1. **scripts/setup-keycloak-simple.sh** - Automated Keycloak setup
2. **scripts/manage-temporal-users.sh** - User management script
3. **scripts/configure-temporal-authorization.sh** - Authorization configuration
4. **scripts/test-authorization.sh** - Authorization testing
5. **scripts/test-logout.sh** - Logout testing

## Security Considerations

1. **JWT Secret**: Use a strong, unique JWT secret in production
2. **HTTPS**: Always use HTTPS in production environments
3. **Cookie Security**: Ensure secure cookie settings for production
4. **User Attributes**: Regularly audit user permissions
5. **Logout**: Ensure complete session cleanup on logout

## Production Deployment

1. Use environment variables for sensitive configuration
2. Enable HTTPS for all communications
3. Use secure cookie settings
4. Implement proper logging and monitoring
5. Regular security audits of user permissions

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review server logs for error messages
3. Verify Keycloak configuration
4. Test with different user accounts
5. Check browser developer tools for network errors
