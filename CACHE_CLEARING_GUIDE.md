# Cache Clearing Guide for Temporal UI

## Issue

The frontend is showing only the `default` namespace even though the API is returning the correct filtered namespaces. This is likely due to browser cache.

## Solution: Complete Cache Clearing

### 1. Browser Cache Clearing

#### Chrome/Edge:

1. Open Developer Tools (F12)
2. Right-click on the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

#### Firefox:

1. Press Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. Or go to Settings > Privacy & Security > Clear Data

#### Safari:

1. Press Cmd+Option+R
2. Or go to Develop > Empty Caches

### 2. Application Storage Clearing

#### Manual Clearing:

1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear the following:
   - **Local Storage**: Right-click > Clear All
   - **Session Storage**: Right-click > Clear All
   - **IndexedDB**: Right-click > Clear All
   - **Cookies**: Right-click > Clear All

#### Programmatic Clearing:

```javascript
// Run this in browser console
localStorage.clear();
sessionStorage.clear();
// Clear IndexedDB
if ('indexedDB' in window) {
  indexedDB.databases().then((databases) => {
    databases.forEach((db) => {
      indexedDB.deleteDatabase(db.name);
    });
  });
}
// Clear all cookies
document.cookie.split(';').forEach((cookie) => {
  const eqPos = cookie.indexOf('=');
  const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  document.cookie =
    name +
    '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' +
    window.location.hostname;
});
```

### 3. Server-Side Cache Clearing

#### Restart the UI Server:

```bash
# Kill existing server
pkill -f ui-server

# Restart server
cd server && ./ui-server --config ./config --env local start
```

### 4. Keycloak Cache Clearing

#### Clear Keycloak Admin Console Cache:

1. Go to http://localhost:8080/admin
2. Login with admin credentials
3. Go to Realm Settings > Cache
4. Click "Clear Cache"

#### Or via kcadm:

```bash
# Clear realm cache
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh clear-cache -r temporal-ui
```

### 5. Complete Testing Steps

1. **Clear all browser data** (as described above)
2. **Restart the UI server**:
   ```bash
   pkill -f ui-server
   cd server && ./ui-server --config ./config --env local start
   ```
3. **Test API directly**:

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

4. **Open browser in incognito/private mode**
5. **Navigate to http://localhost:8088**
6. **Login with admin@temporal.local**
7. **Check namespace dropdown and /namespaces page**

### 6. Verification

After clearing cache, you should see:

- **Admin user**: All 20 namespaces in dropdown and /namespaces page
- **Limited user**: Only 2 namespaces (default, jio-herald-plt)
- **ReadOnly user**: Only 1 namespace (default)

### 7. If Still Not Working

If the issue persists after cache clearing:

1. **Check server logs** for any errors
2. **Verify Keycloak configuration** is correct
3. **Test with fresh browser profile**
4. **Check if Temporal server is running** and accessible

## Quick Fix Script

```bash
#!/bin/bash
echo "Clearing all caches..."

# Kill and restart UI server
pkill -f ui-server
sleep 2
cd server && ./ui-server --config ./config --env local start &
sleep 3

# Clear Keycloak cache
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh clear-cache -r temporal-ui

echo "Cache clearing complete. Please:"
echo "1. Clear your browser cache (Ctrl+Shift+R)"
echo "2. Open browser in incognito mode"
echo "3. Navigate to http://localhost:8088"
echo "4. Login and test"
```
