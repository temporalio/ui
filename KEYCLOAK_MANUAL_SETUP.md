# Keycloak Manual Setup Guide

Since you're getting "Invalid username or password" errors, you need to create users in Keycloak. Here's how to do it manually:

## 🔧 **Step 1: Access Keycloak Admin Console**

1. **Open your browser** and go to: `http://localhost:8080/admin`
2. **Login** with:
   - Username: `admin`
   - Password: `admin123` (or whatever you set)

## 🏗️ **Step 2: Create the Realm (if not exists)**

1. **Click the dropdown** in the top-left corner (usually shows "master")
2. **Click "Create Realm"**
3. **Enter realm name**: `temporal-ui`
4. **Click "Create"**

## 👥 **Step 3: Create Users**

### **Create Admin User**

1. **Go to Users** → **Add user**
2. **Fill in the form**:
   - **Username**: `admin`
   - **Email**: `admin@temporal.local`
   - **First name**: `Admin`
   - **Last name**: `User`
   - **Email verified**: `ON`
   - **Enabled**: `ON`
3. **Click "Create"**
4. **Go to Credentials tab** → **Set password**
5. **Set password**: `admin123`
6. **Click "Set password"**

### **Create Regular User**

1. **Go to Users** → **Add user**
2. **Fill in the form**:
   - **Username**: `user`
   - **Email**: `user@temporal.local`
   - **First name**: `Regular`
   - **Last name**: `User`
   - **Email verified**: `ON`
   - **Enabled**: `ON`
3. **Click "Create"**
4. **Go to Credentials tab** → **Set password**
5. **Set password**: `user123`
6. **Click "Set password"**

## 🔑 **Step 4: Verify Client Configuration**

1. **Go to Clients** → **temporal-ui**
2. **Check Settings tab**:
   - **Client ID**: `temporal-ui`
   - **Enabled**: `ON`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `confidential`
   - **Standard Flow Enabled**: `ON`
3. **Check Valid Redirect URIs**:
   - Should include: `http://localhost:8088/auth/sso/callback`
   - Should include: `http://localhost:8080/auth/sso/callback`

## 🧪 **Step 5: Test Authentication**

1. **Go to your Temporal UI**: `http://localhost:8088`
2. **Click "Sign in with Keycloak"**
3. **You should see the Keycloak login page**
4. **Login with**:
   - Username: `admin`
   - Password: `admin123`
5. **You should be redirected back to Temporal UI**

## 🔍 **Troubleshooting**

### **If you still get "Invalid username or password":**

1. **Check user exists**:
   - Go to Users in Keycloak Admin Console
   - Verify the user is there and enabled

2. **Check password**:
   - Go to user → Credentials tab
   - Make sure password is set correctly

3. **Check realm**:
   - Make sure you're in the `temporal-ui` realm
   - Not the `master` realm

4. **Check client configuration**:
   - Go to Clients → temporal-ui
   - Verify redirect URIs are correct

### **If you get "Invalid redirect URI":**

1. **Go to Clients** → **temporal-ui** → **Settings**
2. **Add to Valid Redirect URIs**:
   ```
   http://localhost:8088/auth/sso/callback
   http://localhost:8080/auth/sso/callback
   ```
3. **Click "Save"**

### **If you get "Invalid client":**

1. **Check client ID** in your configuration
2. **Verify client is enabled**
3. **Check client secret** (if using confidential client)

## 📋 **Quick Test Users**

After setup, you can test with these users:

| Username | Password   | Role         |
| -------- | ---------- | ------------ |
| `admin`  | `admin123` | Admin        |
| `user`   | `user123`  | Regular User |

## 🎯 **Expected Flow**

1. **Temporal UI** → Click "Sign in with Keycloak"
2. **Keycloak Login** → Enter credentials
3. **Keycloak** → Redirect back to Temporal UI
4. **Temporal UI** → Show authenticated interface

## 🚨 **Common Issues**

1. **Wrong realm**: Make sure you're in `temporal-ui` realm, not `master`
2. **User not enabled**: Check user is enabled in Keycloak
3. **Wrong redirect URI**: Verify the callback URL matches exactly
4. **Client not configured**: Check client settings in Keycloak

## 💡 **Pro Tips**

- **Use incognito mode** to test authentication flow
- **Check browser console** for any JavaScript errors
- **Check Temporal UI logs** for authentication errors
- **Verify network connectivity** between services
