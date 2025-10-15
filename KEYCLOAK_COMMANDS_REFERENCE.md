# Keycloak Commands Reference

This document provides a quick reference for all `kcadm.sh` commands used in the Temporal UI authorization setup.

## Environment Variables

```bash
export KEYCLOAK_URL="http://localhost:8080"
export REALM_NAME="temporal-ui"
export CLIENT_ID="temporal-ui"
export ADMIN_USER="sagar"
export ADMIN_PASSWORD="admin@123"
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin
```

## Authentication

```bash
# Login to Keycloak
kcadm.sh config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD
```

## Realm Management

```bash
# Create realm
kcadm.sh create realms -s realm=$REALM_NAME -s enabled=true

# List realms
kcadm.sh get realms

# Get realm details
kcadm.sh get realms/$REALM_NAME
```

## Client Management

```bash
# Create client
kcadm.sh create clients -r $REALM_NAME \
  -s clientId=$CLIENT_ID \
  -s enabled=true \
  -s protocol=openid-connect \
  -s publicClient=false \
  -s directAccessGrantsEnabled=true \
  -s serviceAccountsEnabled=true \
  -s authorizationServicesEnabled=true \
  -s 'redirectUris=["http://localhost:8088/auth/sso/callback"]' \
  -s 'webOrigins=["http://localhost:8088"]' \
  -s rootUrl="http://localhost:8088"

# List clients
kcadm.sh get clients -r $REALM_NAME

# Get client details
kcadm.sh get clients/$CLIENT_UUID -r $REALM_NAME

# Update client
kcadm.sh update clients/$CLIENT_UUID -r $REALM_NAME \
  -s 'redirectUris=["http://localhost:8088/auth/sso/callback","http://localhost:8080/auth/sso/callback"]' \
  -s 'webOrigins=["http://localhost:8088","http://localhost:8080"]'

# Get client secret
kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME
```

## User Management

```bash
# Create user
kcadm.sh create users -r $REALM_NAME \
  -s username=admin@temporal.local \
  -s email=admin@temporal.local \
  -s firstName=Admin \
  -s lastName=User \
  -s enabled=true

# List users
kcadm.sh get users -r $REALM_NAME

# Get user details
kcadm.sh get users/$USER_ID -r $REALM_NAME

# Set user password
kcadm.sh set-password -r $REALM_NAME --username admin@temporal.local --new-password admin123

# Update user attributes
kcadm.sh update users/$USER_ID -r $REALM_NAME \
  -s 'attributes.temporal.namespaces=["*"]' \
  -s 'attributes.temporal.permissions=["*"]' \
  -s 'attributes.temporal.workflow.actions=["*"]'

# Delete user
kcadm.sh delete users/$USER_ID -r $REALM_NAME
```

## User Attributes for Different Roles

### Admin User (Full Access)

```bash
kcadm.sh update users/$USER_ID -r $REALM_NAME \
  -s 'attributes.temporal.namespaces=["*"]' \
  -s 'attributes.temporal.permissions=["*"]' \
  -s 'attributes.temporal.workflow.actions=["*"]'
```

### Limited User (Specific Namespaces)

```bash
kcadm.sh update users/$USER_ID -r $REALM_NAME \
  -s 'attributes.temporal.namespaces=["default","jio-herald-plt"]' \
  -s 'attributes.temporal.permissions=["workflow.read","workflow.write","namespace.read"]' \
  -s 'attributes.temporal.workflow.actions=["reset","terminate","signal","cancel"]'
```

### ReadOnly User (Read-only Access)

```bash
kcadm.sh update users/$USER_ID -r $REALM_NAME \
  -s 'attributes.temporal.namespaces=["default"]' \
  -s 'attributes.temporal.permissions=["workflow.read","namespace.read"]' \
  -s 'attributes.temporal.workflow.actions=[]'
```

## Token Management

```bash
# Get access token
curl -s "$KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token" \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&username=admin@temporal.local&password=admin123" \
  | jq -r '.access_token'

# Decode JWT token (header)
echo "TOKEN_HEADER" | base64 -d

# Decode JWT token (payload)
echo "TOKEN_PAYLOAD" | base64 -d
```

## Common Operations

### Get Client UUID

```bash
CLIENT_UUID=$(kcadm.sh get clients -r $REALM_NAME | jq -r ".[] | select(.clientId == \"$CLIENT_ID\") | .id")
```

### Get User ID

```bash
USER_ID=$(kcadm.sh get users -r $REALM_NAME | jq -r ".[] | select(.username == \"admin@temporal.local\") | .id")
```

### Get Client Secret

```bash
CLIENT_SECRET=$(kcadm.sh get clients/$CLIENT_UUID/client-secret -r $REALM_NAME | jq -r '.value')
```

### Update List of core addtributes:

kcadm.sh get realms/temporal-auth-ui/users/profile > user-profile.json

# Update JSON with 3 new attributes.

kcadm.sh update realms/temporal-auth-ui/users/profile -f user-profile.json

### List User Attributes

```bash
kcadm.sh get users -r $REALM_NAME | jq '.[] | select(.username == "admin@temporal.local") | .attributes'
```

## Troubleshooting Commands

### Check Realm Status

```bash
kcadm.sh get realms/$REALM_NAME | jq '.enabled'
```

### Check Client Status

```bash
kcadm.sh get clients/$CLIENT_UUID -r $REALM_NAME | jq '.enabled'
```

### Check User Status

```bash
kcadm.sh get users/$USER_ID -r $REALM_NAME | jq '.enabled'
```

### Test Authentication

```bash
# Test with admin credentials
kcadm.sh get realms/$REALM_NAME --user $ADMIN_USER --password $ADMIN_PASSWORD
```

## Bulk Operations

### Create Multiple Users

```bash
# Create admin user
kcadm.sh create users -r $REALM_NAME -s username=admin@temporal.local -s email=admin@temporal.local -s firstName=Admin -s lastName=User -s enabled=true

# Create limited user
kcadm.sh create users -r $REALM_NAME -s username=limited@temporal.local -s email=limited@temporal.local -s firstName=Limited -s lastName=User -s enabled=true

# Create readonly user
kcadm.sh create users -r $REALM_NAME -s username=readonly@temporal.local -s email=readonly@temporal.local -s firstName=ReadOnly -s lastName=User -s enabled=true
```

### Set Passwords for All Users

```bash
kcadm.sh set-password -r $REALM_NAME --username admin@temporal.local --new-password admin123
kcadm.sh set-password -r $REALM_NAME --username limited@temporal.local --new-password limited123
kcadm.sh set-password -r $REALM_NAME --username readonly@temporal.local --new-password readonly123
```

## JSON Output Examples

### Client Configuration

```json
{
  "id": "client-uuid",
  "clientId": "temporal-ui",
  "enabled": true,
  "protocol": "openid-connect",
  "publicClient": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true,
  "redirectUris": ["http://localhost:8088/auth/sso/callback"],
  "webOrigins": ["http://localhost:8088"]
}
```

### User Attributes

```json
{
  "temporal.namespaces": ["*"],
  "temporal.permissions": ["*"],
  "temporal.workflow.actions": ["*"]
}
```

### JWT Token Payload

```json
{
  "exp": 1760009424,
  "iat": 1760009124,
  "iss": "http://localhost:8080/realms/temporal-ui",
  "aud": "account",
  "sub": "user-uuid",
  "temporal_workflow_actions": "*",
  "temporal_permissions": "*",
  "temporal_namespaces": "*",
  "name": "Admin User",
  "preferred_username": "admin@temporal.local",
  "email": "admin@temporal.local"
}
```
