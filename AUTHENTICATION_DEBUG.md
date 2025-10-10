# Authentication Debug Guide

## Issue Identified

The frontend is not displaying namespaces because the user is not properly authenticated. The API is working correctly (returning 20 namespaces for admin user when authenticated), but the frontend is not sending the authentication token.

## Root Cause

The user needs to be authenticated through Keycloak first. The frontend is trying to access the API without proper authentication.

## Solution Steps

### 1. Verify Authentication Flow

1. **Open browser in incognito mode**
2. **Navigate to http://localhost:8088**
3. **You should be redirected to Keycloak login page**
4. **Login with admin@temporal.local / admin123**
5. **You should be redirected back to the UI with authentication**

### 2. If Not Redirected to Keycloak

If you're not being redirected to Keycloak, there might be an issue with the authentication configuration. Check:

1. **Server configuration** (`server/config/local.yaml`):

   ```yaml
   auth:
     enabled: true
     providers:
       - label: 'Keycloak Login'
         type: 'oidc'
         providerUrl: 'http://localhost:8080/realms/temporal-ui'
         clientId: 'temporal-ui'
         clientSecret: 'kRIJLLmrhnEmTT0f1hWsB3X8IcZGpBYW'
         callbackUrl: 'http://localhost:8088/auth/sso/callback'
   ```

2. **Keycloak client configuration**:
   - Root URL: `http://localhost:8088`
   - Valid Redirect URIs: `http://localhost:8088/auth/sso/callback`
   - Web Origins: `http://localhost:8088`

### 3. Manual Authentication Test

If the automatic redirect is not working, you can manually test the authentication:

1. **Go to Keycloak login page**: http://localhost:8080/realms/temporal-ui/protocol/openid-connect/auth?client_id=temporal-ui&redirect_uri=http://localhost:8088/auth/sso/callback&response_type=code&scope=openid+profile+email

2. **Login with admin@temporal.local / admin123**

3. **You should be redirected back to the UI**

### 4. Verify Authentication in Browser

After successful authentication, check:

1. **Open Developer Tools (F12)**
2. **Go to Application tab**
3. **Check Local Storage for auth data**
4. **Check Network tab for API requests with Authorization header**

### 5. API Testing

Test the API directly with authentication:

```bash
# Get fresh token
TOKEN=$(curl -s "http://localhost:8080/realms/temporal-ui/protocol/openid-connect/token" \
  -X POST -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=temporal-ui&client_secret=kRIJLLmrhnEmTT0f1hWsB3X8IcZGpBYW&username=admin@temporal.local&password=admin123" \
  | jq -r '.access_token')

# Test namespaces API
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8088/api/v1/namespaces" | jq '.namespaces | length'
# Should return 20 for admin user
```

### 6. Expected Behavior

After proper authentication:

- **Admin user**: Should see all 20 namespaces in dropdown and /namespaces page
- **Limited user**: Should see only 2 namespaces (default, jio-herald-plt)
- **ReadOnly user**: Should see only 1 namespace (default)

### 7. Troubleshooting

If authentication is still not working:

1. **Check server logs** for any errors
2. **Verify Keycloak is running** on port 8080
3. **Check browser console** for any JavaScript errors
4. **Verify the authentication callback URL** is correct
5. **Test with different browsers** (Chrome, Firefox, Safari)

## Quick Fix

If you're still having issues, try this complete reset:

```bash
# 1. Clear all caches
./scripts/clear-cache.sh

# 2. Open browser in incognito mode
# 3. Navigate to http://localhost:8088
# 4. You should be redirected to Keycloak
# 5. Login with admin@temporal.local / admin123
# 6. Check namespaces dropdown and /namespaces page
```

The key issue is that the frontend needs to be properly authenticated through Keycloak before it can access the namespaces API.
