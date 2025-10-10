# Temporal UI Authorization: Roles vs Attributes

## 🔍 **Current Setup Analysis**

### **What We Have Now:**

- ✅ **User Attributes** configured (temporal.namespaces, temporal.permissions, etc.)
- ✅ **Claim Mappers** to include attributes in JWT tokens
- ✅ **Authorization Logic** based on user attributes

### **What We Can Add:**

- 🔄 **Keycloak Roles** for better organization
- 🔄 **Role-based Access Control (RBAC)**
- 🔄 **Easier user management** through role assignments

## 📊 **Comparison: Attributes vs Roles**

| Aspect          | User Attributes          | Keycloak Roles         |
| --------------- | ------------------------ | ---------------------- |
| **Granularity** | Very fine-grained        | Coarse-grained         |
| **Flexibility** | Per-user customization   | Group-based            |
| **Management**  | Individual user settings | Role assignments       |
| **Scalability** | Complex for many users   | Easy for large teams   |
| **Use Case**    | Custom permissions       | Standard role patterns |

## 🎯 **Recommended Approach: Hybrid**

### **Use Roles for:**

- **Standard access patterns** (admin, developer, readonly)
- **Group management** (assign roles to multiple users)
- **Organizational structure** (team-based access)

### **Use Attributes for:**

- **Custom permissions** (specific namespace access)
- **Fine-grained control** (individual user needs)
- **Dynamic permissions** (temporary access)

## 🔧 **Implementation Options**

### **Option 1: Attributes Only (Current)**

```yaml
# User has specific attributes
temporal.namespaces: ['default', 'production']
temporal.permissions: ['workflow.read', 'workflow.signal']
temporal.workflow.actions: ['signal']
```

**Pros:**

- Maximum flexibility
- Per-user customization
- Fine-grained control

**Cons:**

- Complex management
- Hard to scale
- No group-based access

### **Option 2: Roles Only**

```yaml
# User has roles
roles: ['temporal-admin', 'temporal-developer']
```

**Pros:**

- Easy management
- Group-based access
- Standard patterns

**Cons:**

- Less flexible
- Hard to customize
- Limited granularity

### **Option 3: Hybrid (Recommended)**

```yaml
# User has both roles and attributes
roles: ['temporal-developer']
temporal.namespaces: ['default', 'staging']
temporal.permissions: ['workflow.read', 'workflow.start']
```

**Pros:**

- Best of both worlds
- Flexible and manageable
- Scalable

**Cons:**

- More complex setup
- Requires careful planning

## 🚀 **Quick Setup Commands**

### **Current Status:**

```bash
# Check current user attributes
./scripts/manage-temporal-users.sh list
```

### **Add Roles (Optional):**

```bash
# Setup roles and assign them
./scripts/setup-temporal-roles.sh
```

### **Check Both:**

```bash
# List users with attributes
kcadm.sh get users -r temporal-ui --fields id,username,attributes

# List roles
kcadm.sh get roles -r temporal-ui --fields id,name,description

# List user role assignments
kcadm.sh get users/{user-id}/role-mappings/realm -r temporal-ui
```

## 🎭 **Role Definitions**

| Role                    | Namespaces                          | Permissions                                             | Workflow Actions     |
| ----------------------- | ----------------------------------- | ------------------------------------------------------- | -------------------- |
| **temporal-admin**      | `*`                                 | `*`                                                     | `*`                  |
| **temporal-readonly**   | `default`                           | `workflow.read`                                         | none                 |
| **temporal-developer**  | `default`, `development`, `staging` | `workflow.read`, `workflow.start`, `workflow.signal`    | `start`, `signal`    |
| **temporal-limited**    | `default`, `production`             | `workflow.read`, `workflow.signal`                      | `signal`             |
| **temporal-production** | `production`                        | `workflow.read`, `workflow.start`, `workflow.terminate` | `start`, `terminate` |

## 🔐 **Authorization Logic**

### **Priority Order:**

1. **User Attributes** (highest priority)
2. **Role-based permissions** (fallback)
3. **Default permissions** (lowest priority)

### **Example Logic:**

```go
func CheckPermission(user User, permission string) bool {
    // Check user attributes first
    if user.HasAttribute("temporal.permissions", permission) {
        return true
    }

    // Check role-based permissions
    for _, role := range user.Roles {
        if role.HasPermission(permission) {
            return true
        }
    }

    // Default to read-only
    return permission == "workflow.read"
}
```

## 🧪 **Testing Authorization**

### **Test User Attributes:**

```bash
# Login and check JWT token
curl -H "Authorization: Bearer <token>" \
     -H "X-Temporal-Namespace: production" \
     http://localhost:8088/api/workflows
```

### **Test Role-based Access:**

```bash
# Check user roles in JWT
jwt decode <token> | grep roles
```

## 📋 **Recommendation**

### **For Your Use Case:**

Since you want **granular control** at the namespace level, I recommend:

1. **Keep the current attribute-based system** (it's working well)
2. **Add roles for organization** (optional but helpful)
3. **Use hybrid approach** for maximum flexibility

### **Next Steps:**

```bash
# Option 1: Keep current setup (recommended)
# Your current attribute-based system is perfect for granular control

# Option 2: Add roles for better organization
./scripts/setup-temporal-roles.sh

# Option 3: Use both (maximum flexibility)
# Run both scripts for hybrid approach
```

## 🎉 **Conclusion**

**You don't need to add roles** - your current attribute-based system provides excellent granular control. However, adding roles can help with organization and management, especially as your user base grows.

The choice depends on your needs:

- **Fine-grained control**: Keep attributes only
- **Easy management**: Add roles
- **Maximum flexibility**: Use both
