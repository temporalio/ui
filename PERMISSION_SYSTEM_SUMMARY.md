# 🔐 Frontend Permission System - Complete Summary

## ✅ **What's Implemented**

Version **0.0.15** includes comprehensive frontend-based permission control using JWT claims from Keycloak.

---

## 📋 **User Attributes in Keycloak**

Each user should have these attributes set:

### **1. temporal_namespaces**

Controls which namespaces the user can see.

**Examples:**

- `*` = All namespaces (admin)
- `default,jio-herald-plt` = Only these 2 namespaces
- `default` = Only default namespace

### **2. temporal_permissions**

Controls broad access rights (read/write).

**Examples:**

- `*` = All permissions
- `workflow.read,workflow.write,namespace.read,namespace.write` = Full access
- `workflow.read,namespace.read` = Read-only
- `workflow.read` = Can only view workflows

**Available Permissions:**

- `workflow.read` - View workflows
- `workflow.write` - Modify workflows
- `namespace.read` - View namespaces
- `namespace.write` - Modify namespaces
- `schedule.read` - View schedules
- `schedule.write` - Create/modify schedules
- `batch.operations` - Perform batch operations

### **3. temporal_workflow_actions**

Controls specific workflow actions.

**Examples:**

- `*` = All actions allowed
- `signal,update` = Only signal and update
- `terminate,cancel,signal` = Can terminate, cancel, and signal
- `` (empty) = No actions allowed

**Available Actions:**

- `terminate` - Terminate workflows
- `cancel` - Cancel workflows
- `signal` - Send signals to workflows
- `update` - Update workflows
- `reset` - Reset workflows

---

## 🎯 **Permission Checks Implemented**

### **Namespace Filtering**

✅ **File**: `src/lib/utilities/namespace-filter.ts`  
✅ **Function**: `filterNamespacesByUserPermissions()`  
✅ **Used in**:

- Namespace dropdown (`src/routes/(app)/+layout.svelte`)
- Namespace selection page (`src/routes/(app)/select-namespace/+page.svelte`)
- Namespaces list page (`src/routes/(app)/namespaces/+page.svelte`)

### **Workflow Actions**

✅ **Files**:

- `src/lib/utilities/workflow-terminate-enabled.ts`
- `src/lib/utilities/workflow-cancel-enabled.ts`
- `src/lib/utilities/workflow-signal-enabled.ts`
- `src/lib/utilities/workflow-reset-enabled.ts`
- `src/lib/utilities/workflow-update-enabled.ts`

✅ **Checks**: Each checks if user has the specific action in `temporal_workflow_actions`

### **Start Workflow Button**

✅ **File**: `src/lib/utilities/workflow-create-disabled.ts`  
✅ **Checks**: `temporal_permissions` includes `workflow.write`

### **Batch Operations**

✅ **File**: `src/lib/utilities/bulk-actions-enabled.ts`  
✅ **Checks**: `temporal_permissions` includes `batch.operations` or `workflow.write`

### **Schedule Create/Modify**

✅ **File**: `src/lib/utilities/write-actions-are-allowed.ts`  
✅ **Checks**: `temporal_permissions` includes `workflow.write` or `schedule.write`

---

## 👥 **Example User Configurations**

### **Admin User**

```yaml
Keycloak Attributes:
  temporal.namespaces: '*'
  temporal.permissions: '*'
  temporal.workflow_actions: '*'

Can Do: ✅ See all 19 namespaces
  ✅ Start workflows
  ✅ Terminate, cancel, signal, update, reset
  ✅ Batch operations
  ✅ Create schedules
  ✅ Everything!
```

### **Limited User**

```yaml
Keycloak Attributes:
  temporal.namespaces: "default,jio-herald-plt"
  temporal.permissions: "workflow.read,workflow.write"
  temporal.workflow_actions: "signal,update"

Can Do:
  ✅ See 2 namespaces: default, jio-herald-plt
  ✅ Start workflows
  ✅ Signal and update workflows
  ❌ Cannot terminate or cancel
  ❌ Cannot see other namespaces
  ✅ Batch operations (has workflow.write)
```

### **Readonly User**

```yaml
Keycloak Attributes:
  temporal.namespaces: "default"
  temporal.permissions: "workflow.read"
  temporal.workflow_actions: ""

Can Do:
  ✅ See 1 namespace: default
  ❌ Cannot start workflows
  ❌ Cannot terminate, cancel, signal, update, or reset
  ❌ Cannot batch operations
  ❌ Cannot create schedules
  ✅ Can only view workflows
```

---

## 🔧 **How to Configure Users in Keycloak**

### **Step 1: Set User Attributes**

In Keycloak Admin Console:

1. Go to **Realm: temporal-ui** → **Users**
2. Select user → **Attributes** tab
3. Add:
   - Key: `temporal.namespaces`, Value: `default,jio-herald-plt`
   - Key: `temporal.permissions`, Value: `workflow.read,workflow.write`
   - Key: `temporal.workflow_actions`, Value: `signal`
4. Click **Save**

### **Step 2: Verify Client Mappers**

Go to **Clients** → **temporal-ui** → **Client scopes** → **temporal-ui-dedicated** → **Mappers**

Ensure these 3 mappers exist:

#### **Mapper 1: temporal_namespaces**

- User Attribute: `temporal.namespaces`
- Token Claim Name: `temporal_namespaces`
- Add to ID token: ✅ ON

#### **Mapper 2: temporal_permissions**

- User Attribute: `temporal.permissions`
- Token Claim Name: `temporal_permissions`
- Add to ID token: ✅ ON

#### **Mapper 3: temporal_workflow_actions**

- User Attribute: `temporal.workflow_actions`
- Token Claim Name: `temporal_workflow_actions`
- Add to ID token: ✅ ON

---

## 🧪 **Testing**

### **Test Readonly User:**

```bash
# Get token
curl -s -X POST "http://10.166.181.98:30080/realms/temporal-ui/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=temporal-ui" \
  -d "client_secret=DAqgktwGb91c0AXo1DbhPHpg7XWRupGB" \
  -d "grant_type=password" \
  -d "username=readonly@temporal.local" \
  -d "password=readonly123" \
  -d "scope=openid email profile" | jq -r '.id_token' | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '{
    email,
    temporal_namespaces,
    temporal_permissions,
    temporal_workflow_actions
  }'
```

Expected output:

```json
{
  "email": "readonly@temporal.local",
  "temporal_namespaces": "default",
  "temporal_permissions": "workflow.read",
  "temporal_workflow_actions": ""
}
```

### **Test in UI:**

1. Login as readonly user
2. Check namespace dropdown → Should see only "default"
3. Navigate to default namespace workflows
4. **All action buttons should be disabled/hidden:**
   - ❌ Start Workflow button (disabled)
   - ❌ Terminate button (hidden)
   - ❌ Cancel button (hidden)
   - ❌ Signal button (hidden)
   - ❌ Reset button (hidden)
   - ❌ Batch operations (disabled)

---

## 📝 **Deployment**

Version **0.0.15** includes all permission checks.

```bash
# Build
./server/docker-build-amd64-force.sh

# Tag
docker tag temporal-ui-auth:latest \
  devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.15

# Push
docker push devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.15

# Deploy
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.15 \
  -n platform-services
```

---

## ⚠️ **Important Notes**

### **Frontend-Only Security**

- ✅ Good for: Internal tools with trusted users
- ✅ Good for: Multi-tenancy UI segregation
- ⚠️ Not sufficient for: High-security environments
- ⚠️ Not sufficient for: Untrusted users (they can bypass in browser DevTools)

### **For Production Security:**

Consider adding **server-side authorization** in the future to enforce permissions at the API level.

### **Current Architecture:**

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Browser │ ──> │ Keycloak │ ──> │ Go Server  │ ──> │ Temporal │
│         │     │  (Auth)  │     │  (Proxy)   │     │  Server  │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
     │                │                  │
     │                │                  │
     ▼                ▼                  ▼
  JWT Token ──> ID Token ──> Sets Cookie ──> Returns ALL data
     │                                           │
     └─────────────────────────────────────────┘
               Frontend filters based on claims
```

---

## 🎉 **Success!**

Your Temporal UI now has:

- ✅ Namespace filtering by user
- ✅ Workflow action control
- ✅ Permission-based button states
- ✅ Role-based access control
- ✅ All controlled via Keycloak JWT claims

Enjoy your secure, multi-tenant Temporal UI! 🚀
