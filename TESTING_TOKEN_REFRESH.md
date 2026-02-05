# Testing Authentication Features

The UI implements automatic OAuth2 token refresh and configurable session duration to provide secure, uninterrupted user sessions.

## Quick Test

1. **Start the dev server with auth**:

   ```bash
   pnpm dev:with-auth
   ```

2. **Login**:

   - Navigate to http://localhost:3000
   - Login with any username (e.g., `testuser`)
   - You should see the UI load successfully

3. **Verify refresh token cookie**:

   - Open browser DevTools → Application tab → Cookies
   - Check for `refresh` cookie (HttpOnly, 30 day expiry)
   - Check for `user0` cookie (1 minute expiry, contains access token)

4. **Wait for token expiration**:

   - Tokens expire after 60 seconds
   - Open DevTools → Network tab
   - Wait 60+ seconds

5. **Trigger a request**:

   - Navigate to a different page or trigger any API call
   - Watch the Network tab

6. **Observe automatic refresh**:
   - First request → `401 Unauthorized` (expired token)
   - `/auth/refresh` → `200 OK` (exchanging refresh token)
   - Original request retries → `200 OK` (with new token)
   - UI continues working seamlessly

## What to Look For

### Success Case (Refresh Works)

- First API call after expiration: `401 Unauthorized`
- `/auth/refresh` call: `200 OK`
- Original request automatically retries: `200 OK`
- New cookies are set with fresh tokens
- UI continues without interruption or login redirect

### Failure Case (Refresh Token Expired)

- First API call: `401 Unauthorized`
- `/auth/refresh` call: `401 Unauthorized`
- Browser redirects to login page (`/auth/sso`)

## Configuration

### Token Expiration Times

- **Access token**: 60 seconds (`utilities/oidc-server/support/configuration.ts:7`)
- **ID token**: 60 seconds (`utilities/oidc-server/support/configuration.ts:8`)
- **Refresh token**: 1 day (`utilities/oidc-server/support/configuration.ts:9`)
- **User cookie**: 1 minute (`server/server/auth/auth.go:80`)
- **Refresh cookie**: 30 days (`server/server/auth/auth.go:94`)

### Required OIDC Configuration

- **Grant types**: `authorization_code`, `refresh_token` (`utilities/oidc-server/support/configuration.ts:19`)
- **Scopes**: `openid`, `profile`, `email`, `offline_access` (`server/config/with-auth.yaml:33-37`)
- **issueRefreshToken**: Must return `true` (`utilities/oidc-server/support/configuration.ts:12-14`)

The `offline_access` scope and `issueRefreshToken` callback are critical for refresh tokens to be issued.

## How It Works

1. User logs in via OAuth2 authorization code flow
2. OIDC server issues access token, ID token, and refresh token
3. UI server stores refresh token in HttpOnly cookie (secure, not accessible to JavaScript)
4. Frontend stores access/ID tokens in short-lived cookies
5. When tokens expire (after 60s), API requests return 401
6. Frontend automatically calls `/auth/refresh` with refresh token cookie
7. Server exchanges refresh token for new access/ID tokens
8. New tokens are stored in cookies
9. Original request retries with new tokens
10. User session continues seamlessly

## Token Lifetime Configuration

### Current Implementation

The refresh token cookie lifetime is **automatically synchronized** with the OIDC provider's refresh token expiry:

- **Test Environment**: 24 hours (configured in `utilities/oidc-server/support/configuration.ts`)
- **Production**: Determined by your OIDC provider's configuration
- **Safety Cap**: Maximum 30 days (even if IdP returns longer expiry)

### Why This Matters

If the cookie lifetime exceeds the actual token validity:

- Users see confusing "session expired" errors
- Cookie exists but refresh fails with `invalid_grant`

With automatic synchronization:

- Cookie expires when token expires (or before)
- Users are redirected to login when appropriate
- No stale cookies lingering after token expiry

## Logout

To test logout functionality:

```bash
# While authenticated, call logout endpoint
curl -b cookies.txt http://localhost:8081/auth/logout

# Verify cookies are cleared
cat cookies.txt  # Should show no auth cookies
```

In the UI:

```typescript
import { logout } from '$lib/utilities/auth-user';

// In a component
<button on:click={logout}>Logout</button>
```

## Known Limitations

These items are **out of scope** for the refresh token implementation and will be addressed in a future architectural refactor:

1. **No Refresh Token Rotation**: The same refresh token is reused across multiple access token refreshes. This is acceptable with our short token lifetimes but would benefit from single-use rotation in the future.

2. **Tokens in Browser Storage**: Access tokens are stored in localStorage, making them vulnerable to XSS attacks. This is a pre-existing architectural decision that requires broader refactoring (BFF pattern) to fix properly.

3. **No Revocation Tracking**: Once a refresh token is issued, there's no server-side tracking to revoke it before natural expiry (except through logout cookie clearing). True revocation requires server-side session storage.

These limitations are documented for future work and don't prevent the refresh token functionality from working securely within the current architecture.
