---
name: auth-testing
description: Test OAuth2 token refresh and session expiry locally. Use when working on auth, tokens, SSO, OIDC, or session management features.
---

# Auth Testing Skill

Test OAuth2 authentication flows locally using the built-in OIDC server.

## Quick Start

```bash
pnpm dev:with-auth
```

This starts:

- **Vite dev server**: http://localhost:3000
- **UI Server** (Go): http://localhost:8081
- **OIDC Server**: http://localhost:8889
- **Temporal Server**: http://localhost:7233

## Configuration Files

| File                                             | Purpose                                                 |
| ------------------------------------------------ | ------------------------------------------------------- |
| `server/config/with-auth.yaml`                   | UI server auth settings (maxSessionDuration, providers) |
| `utilities/oidc-server/support/configuration.ts` | OIDC server TTLs (token expiry, session duration)       |

## Testing Scenarios

### 1. Token Refresh

Test that tokens refresh automatically before expiry.

**Config**: AccessToken TTL (60s) < maxSessionDuration (2m)

**Steps**:

1. Login at http://localhost:3000
2. Open browser DevTools > Network tab
3. Wait ~60 seconds
4. Observe `/auth/refresh` request that renews tokens

### 2. Session Expiry

Test that sessions expire and force re-login.

**Config**: maxSessionDuration = Session TTL (both 2m)

**Steps**:

1. Login at http://localhost:3000
2. Wait 2 minutes
3. Make any API request (navigate, refresh)
4. Should redirect to OIDC login page

### 3. Unlimited Session

Test long-lived sessions with only token refresh.

**Config changes**:

```yaml
# server/config/with-auth.yaml
auth:
  maxSessionDuration: 0 # Disable session limit
```

```typescript
// utilities/oidc-server/support/configuration.ts
ttl: {
  Session: 60 * 60 * 24,  // 1 day
}
```

## Max Session Duration

The `maxSessionDuration` config enforces a hard limit on how long a user can stay logged in, independent of token expiry.

### How it works

1. **On login**: Server sets `session_start` cookie with current timestamp
2. **On each request**: Server validates session age against `maxSessionDuration`
3. **On expiry**: Server returns 401, UI redirects to SSO login

### Config location

```yaml
# server/config/with-auth.yaml
auth:
  enabled: true
  maxSessionDuration: 2m # Duration string (e.g., 30m, 1h, 24h)
  # Set to 0 or omit to disable
```

### Difference from token expiry

| Mechanism          | Controls                 | Behavior on expiry                 |
| ------------------ | ------------------------ | ---------------------------------- |
| Token TTL          | How often tokens refresh | Silent refresh via `/auth/refresh` |
| maxSessionDuration | Total session lifetime   | Full re-authentication required    |

### Use cases

- **Security compliance**: Force re-auth every N hours regardless of activity
- **Testing**: Set short duration (2m) to quickly test session expiry flow
- **Production**: Set longer duration (8h, 24h) based on security requirements

## Key Relationships

```
AccessToken TTL < maxSessionDuration  → Enables token refresh
Session TTL = maxSessionDuration      → Forces re-auth at OIDC on expiry
RefreshToken TTL > Session TTL        → Allows refresh within session
```

## Current Default Values

| Setting              | Value | Location         |
| -------------------- | ----- | ---------------- |
| Access Token TTL     | 60s   | OIDC config      |
| ID Token TTL         | 60s   | OIDC config      |
| Refresh Token TTL    | 1 day | OIDC config      |
| OIDC Session TTL     | 2m    | OIDC config      |
| Max Session Duration | 2m    | UI server config |

## Debugging

### View auth logs

The Go server logs token validation:

```
[Auth] Setting refresh token cookie (length: X)
[JWT Validation] Token valid, expires at X (time remaining: X)
```

### Check cookies

In browser DevTools > Application > Cookies:

- `user0`, `user1`... - Base64 encoded user data (short-lived)
- `refresh` - HttpOnly refresh token (long-lived)
- `session_start` - Session start timestamp (HttpOnly)

### Test endpoints

```bash
# Get OIDC discovery
curl http://localhost:8889/.well-known/openid-configuration

# Manual token refresh (requires valid refresh cookie)
curl -X GET http://localhost:8081/auth/refresh --cookie "refresh=<token>"
```

## Related Files

- `server/server/route/auth.go` - Auth routes and callbacks
- `server/server/auth/auth.go` - Token validation and session management
- `server/server/config/config.go` - Auth config struct
- `src/lib/utilities/auth-refresh.ts` - Client-side refresh logic
