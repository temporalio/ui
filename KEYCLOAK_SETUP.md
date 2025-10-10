# Keycloak Setup Guide for Temporal UI

This guide will help you set up Keycloak as an authentication provider for the Temporal UI.

## 🚀 **Prerequisites**

- Keycloak server running (version 15+ recommended)
- Admin access to Keycloak
- Temporal UI ready for configuration

## 📋 **Step 1: Create a Realm**

### **Option A: Using Keycloak Admin Console**

1. **Access Keycloak Admin Console**
   - Go to `http://your-keycloak-server:8080/admin`
   - Login with admin credentials

2. **Create New Realm**
   - Click the dropdown in the top-left corner (usually shows "master")
   - Click **"Create Realm"**
   - Enter realm name: `temporal-ui` (or your preferred name)
   - Click **"Create"**

### **Option B: Using Keycloak CLI**

```bash
# Create realm using kcadm.sh
./kcadm.sh create realms -s realm=temporal-ui -s enabled=true
```

## 🔧 **Step 2: Configure Realm Settings**

### **General Settings**

1. Go to **Realm Settings** → **General**
2. Configure:
   - **Realm name**: `temporal-ui`
   - **Display name**: `Temporal UI`
   - **Enabled**: `ON`
   - **User managed access**: `OFF` (unless you need it)

### **Login Settings**

1. Go to **Realm Settings** → **Login**
2. Configure:
   - **User registration**: `OFF` (recommended for production)
   - **Forgot password**: `ON`
   - **Remember me**: `ON`
   - **Verify email**: `ON` (recommended)

## 👥 **Step 3: Create Users**

### **Create Admin User**

1. Go to **Users** → **Add user**
2. Fill in:
   - **Username**: `admin`
   - **Email**: `admin@yourcompany.com`
   - **First name**: `Admin`
   - **Last name**: `User`
   - **Email verified**: `ON`
   - **Enabled**: `ON`
3. Click **"Create"**
4. Go to **Credentials** tab → **Set password**
5. Set a strong password and click **"Set password"**

### **Create Regular Users**

1. Go to **Users** → **Add user**
2. Fill in user details
3. Set password in **Credentials** tab
4. Enable the user

## 🔑 **Step 4: Create OAuth Client**

### **Create Client**

1. Go to **Clients** → **Create**
2. Configure:
   - **Client ID**: `temporal-ui`
   - **Client Protocol**: `openid-connect`
   - **Root URL**: `https://your-temporal-ui-domain:8080`
3. Click **"Save"**

### **Configure Client Settings**

1. Go to **Clients** → **temporal-ui** → **Settings**
2. Configure:
   - **Client ID**: `temporal-ui`
   - **Name**: `Temporal UI`
   - **Description**: `Temporal UI Authentication Client`
   - **Enabled**: `ON`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `confidential`
   - **Standard Flow Enabled**: `ON`
   - **Implicit Flow Enabled**: `OFF`
   - **Direct Access Grants Enabled**: `OFF`
   - **Service Accounts Enabled**: `OFF`
   - **Authorization Enabled**: `OFF`

### **Configure Valid Redirect URIs**

1. Go to **Clients** → **temporal-ui** → **Settings**
2. In **Valid Redirect URIs**, add:
   ```
   https://your-temporal-ui-domain:8080/auth/sso/callback
   http://localhost:8080/auth/sso/callback
   ```
3. In **Web Origins**, add:
   ```
   https://your-temporal-ui-domain:8080
   http://localhost:8080
   ```

### **Get Client Credentials**

1. Go to **Clients** → **temporal-ui** → **Credentials**
2. Note down:
   - **Client ID**: `temporal-ui`
   - **Client Secret**: Click **"Regenerate Secret"** and copy it

## 🎨 **Step 5: Configure Login Theme (Optional)**

1. Go to **Realm Settings** → **Themes**
2. Configure:
   - **Login theme**: `keycloak` (or custom theme)
   - **Account theme**: `keycloak`
   - **Admin theme**: `keycloak`
   - **Email theme**: `keycloak`

## 🔐 **Step 6: Configure Security Settings**

### **Password Policy**

1. Go to **Realm Settings** → **Security Defenses**
2. Configure password policy:
   - **Password length**: `8`
   - **Digits**: `1`
   - **Lower case**: `1`
   - **Upper case**: `1`
   - **Special chars**: `1`

### **Brute Force Detection**

1. Go to **Realm Settings** → **Security Defenses**
2. Enable:
   - **Brute Force Detection**: `ON`
   - **Permanent Lockout**: `OFF`
   - **Max Login Failures**: `5`
   - **Wait Increment**: `60`
   - **Max Wait**: `900`
   - **Min Quick Login Wait**: `60`

## 📊 **Step 7: Configure Temporal UI**

### **Environment Variables**

```bash
# Keycloak Configuration
export TEMPORAL_ADDRESS="your-temporal-server:7233"
export AUTH_ENABLED="true"
export AUTH_PROVIDER_URL="https://your-keycloak-server/realms/temporal-ui"
export AUTH_CLIENT_ID="temporal-ui"
export AUTH_CLIENT_SECRET="your-client-secret"
export AUTH_CALLBACK_URL="https://your-temporal-ui-domain:8080/auth/sso/callback"
export AUTH_SCOPES="openid,profile,email"
export AUTH_LABEL="Sign in with Keycloak"
```

### **Using the Startup Script**

```bash
# Set Keycloak configuration
export TEMPORAL_ADDRESS="your-temporal-server:7233"
export AUTH_ENABLED="true"
export AUTH_PROVIDER_URL="https://your-keycloak-server/realms/temporal-ui"
export AUTH_CLIENT_ID="temporal-ui"
export AUTH_CLIENT_SECRET="your-client-secret"
export AUTH_CALLBACK_URL="https://your-temporal-ui-domain:8080/auth/sso/callback"

# Run the startup script
./scripts/start-ui-with-auth.sh
```

### **Docker Configuration**

```bash
docker run -d \
  --name temporal-ui \
  -p 8080:8080 \
  -e TEMPORAL_ADDRESS="your-temporal-server:7233" \
  -e TEMPORAL_AUTH_ENABLED="true" \
  -e TEMPORAL_AUTH_PROVIDER_URL="https://your-keycloak-server/realms/temporal-ui" \
  -e TEMPORAL_AUTH_CLIENT_ID="temporal-ui" \
  -e TEMPORAL_AUTH_CLIENT_SECRET="your-client-secret" \
  -e TEMPORAL_AUTH_CALLBACK_URL="https://your-temporal-ui-domain:8080/auth/sso/callback" \
  -e TEMPORAL_AUTH_SCOPES="openid,profile,email" \
  temporalio/ui:latest
```

## 🧪 **Step 8: Testing**

### **Test Authentication Flow**

1. Start your Temporal UI
2. Navigate to the UI URL
3. You should see a "Sign in with Keycloak" button
4. Click it to test the OAuth flow
5. You should be redirected to Keycloak login page
6. After successful login, you should be redirected back to Temporal UI

### **Verify User Access**

1. Login to Temporal UI
2. Check if you can access Temporal workflows and other features
3. Test logout functionality

## 🔧 **Advanced Configuration**

### **Custom Claims (Optional)**

If you need custom user claims:

1. Go to **Clients** → **temporal-ui** → **Client Scopes**
2. Create a new scope: `temporal-claims`
3. Go to **Mappers** → **Create**
4. Configure:
   - **Name**: `temporal-claims-mapper`
   - **Mapper Type**: `User Attribute`
   - **User Attribute**: `temporal-role`
   - **Token Claim Name**: `temporal_role`
   - **Claim JSON Type**: `String`

### **Role-Based Access (Optional)**

1. Go to **Realm Roles** → **Create Role**
2. Create roles like: `temporal-admin`, `temporal-user`
3. Assign roles to users
4. Configure client mappers to include roles in tokens

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"redirect_uri_mismatch"**
   - Check that your callback URL matches exactly in Keycloak
   - Ensure protocol (http/https) matches

2. **"invalid_client"**
   - Verify client ID and secret
   - Check if client is enabled

3. **"access_denied"**
   - Check user is enabled
   - Verify user has proper permissions

4. **"invalid_grant"**
   - Check if client is configured for the correct flow
   - Verify redirect URI configuration

### **Debug Steps**

1. Check Keycloak logs: `tail -f /opt/keycloak/logs/keycloak.log`
2. Enable debug logging in Keycloak
3. Check Temporal UI logs for authentication errors
4. Verify network connectivity between services

## 📚 **Additional Resources**

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OIDC Configuration](https://openid.net/connect/)
- [Temporal UI Authentication](https://docs.temporal.io/references/web-ui-configuration)

## 🔒 **Security Best Practices**

1. **Use HTTPS** in production
2. **Regular password rotation** for client secrets
3. **Enable audit logging** in Keycloak
4. **Configure proper CORS** settings
5. **Use strong password policies**
6. **Enable brute force protection**
7. **Regular security updates** for Keycloak
