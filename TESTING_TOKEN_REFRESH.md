# Testing Token Refresh Flow

The UI now implements automatic OAuth2 token refresh to prevent session interruptions when access tokens expire.

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
