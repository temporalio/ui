# Authentication

Temporal UI supports OAuth2/OIDC authentication with automatic token refresh and configurable session duration.

## Quick Start

```bash
pnpm dev:with-auth  # Start with local OIDC server for testing
```

## Configuration

Authentication is configured in your UI server YAML configuration file under the `auth` section.

### Basic Example

```yaml
auth:
  enabled: true
  providers:
    - label: My Identity Provider
      type: oidc
      providerUrl: https://your-idp.example.com/
      clientId: your-client-id
      clientSecret: your-client-secret
      scopes:
        - openid
        - profile
        - email
        - offline_access # Typically required by OIDC providers for refresh tokens
      callbackUrl: https://your-temporal-ui.example.com/auth/sso/callback
```

### Configuration Reference

#### Auth Settings

| Field                | Type     | Description                                                                                                                    |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`            | boolean  | Enable or disable authentication                                                                                               |
| `maxSessionDuration` | duration | Maximum session duration before forced re-login (e.g., `8h`, `24h`, `168h`). Set to `0` or omit for unlimited session duration |
| `providers`          | array    | List of auth providers (currently only the first is used)                                                                      |

#### Provider Settings

| Field                | Type    | Description                                                     |
| -------------------- | ------- | --------------------------------------------------------------- |
| `label`              | string  | Display name for the provider                                   |
| `type`               | string  | Provider type. Only `oidc` is supported                         |
| `providerUrl`        | string  | OIDC discovery URL (e.g., `https://accounts.google.com/`)       |
| `issuerUrl`          | string  | Optional. Set only if issuer differs from provider URL          |
| `clientId`           | string  | OAuth2 client ID                                                |
| `clientSecret`       | string  | OAuth2 client secret                                            |
| `scopes`             | array   | OAuth2 scopes. Include `offline_access` to enable token refresh |
| `callbackUrl`        | string  | OAuth2 callback URL for your deployment                         |
| `options`            | object  | Additional URL parameters for the auth redirect                 |
| `useIdTokenAsBearer` | boolean | Use ID token instead of access token in Authorization header    |

## Session Duration Management

### Token Refresh vs Session Duration

Temporal UI supports two mechanisms for session management:

1. **Token Refresh**: When access tokens expire, the UI automatically refreshes them using the refresh token. Users stay logged in seamlessly.

2. **Max Session Duration**: Forces users to re-authenticate after a specified time, regardless of token validity.

### Configuring Max Session Duration

```yaml
auth:
  enabled: true
  maxSessionDuration: 8h # Force re-login after 8 hours
  providers:
    # ... provider config
```

**Example values:**

- `30m` - 30 minutes
- `8h` - 8 hours (typical workday)
- `24h` - 24 hours
- `168h` - 1 week
- `0` or omitted - No maximum (session lasts until refresh token expires)

### How It Works

1. When a user logs in, the server records the session start time
2. On each request, the server checks if the session has exceeded `maxSessionDuration`
3. If exceeded, the server returns 401 and the user must re-authenticate at the identity provider

This is useful for compliance requirements where users must periodically re-verify their identity, independent of token validity.

## Provider-Specific Configuration

### Azure AD / Entra ID

```yaml
auth:
  enabled: true
  providers:
    - label: Azure AD
      type: oidc
      providerUrl: https://login.microsoftonline.com/{tenant-id}/v2.0
      clientId: your-client-id
      clientSecret: your-client-secret
      scopes:
        - openid
        - profile
        - email
        - offline_access
      callbackUrl: https://temporal-ui.example.com/auth/sso/callback
```

### Auth0

```yaml
auth:
  enabled: true
  providers:
    - label: Auth0
      type: oidc
      providerUrl: https://your-tenant.auth0.com/
      clientId: your-client-id
      clientSecret: your-client-secret
      scopes:
        - openid
        - profile
        - email
        - offline_access
      callbackUrl: https://temporal-ui.example.com/auth/sso/callback
      options:
        audience: your-api-identifier
```

### Okta

```yaml
auth:
  enabled: true
  providers:
    - label: Okta
      type: oidc
      providerUrl: https://your-org.okta.com/
      clientId: your-client-id
      clientSecret: your-client-secret
      scopes:
        - openid
        - profile
        - email
        - offline_access
      callbackUrl: https://temporal-ui.example.com/auth/sso/callback
```

### Google

```yaml
auth:
  enabled: true
  providers:
    - label: Google
      type: oidc
      providerUrl: https://accounts.google.com/
      clientId: your-client-id
      clientSecret: your-client-secret
      scopes:
        - openid
        - profile
        - email
      callbackUrl: https://temporal-ui.example.com/auth/sso/callback
```

Note: Google does not support `offline_access` scope. Token refresh depends on Google's token policies.

## Security Considerations

### Callback URL

The callback URL must:

- Match exactly what's registered with your identity provider
- Use HTTPS in production
- Point to `/auth/sso/callback` on your Temporal UI server

### Client Secret

Store the client secret securely. Consider:

- Environment variable substitution if your deployment supports it
- Kubernetes secrets
- HashiCorp Vault or similar secrets management

### CORS Configuration

When authentication is enabled, ensure your CORS settings allow the callback:

```yaml
cors:
  allowOrigins:
    - https://temporal-ui.example.com
  cookieInsecure: false # Set true only for non-HTTPS development
```

## Troubleshooting

### "Session expired" immediately after login

Check that:

- `maxSessionDuration` is set to a reasonable value (not too short)
- Server time is synchronized (NTP)

### Token refresh not working

Ensure:

- `offline_access` scope is included and enabled in your IdP
- Refresh tokens are enabled in your IdP configuration
- The refresh token hasn't expired (check IdP settings)

### Redirect loop after login

Verify:

- `callbackUrl` matches exactly what's configured in your IdP
- No trailing slashes mismatch
- Protocol (http vs https) matches

### 401 errors on API requests

Check:

- Token hasn't expired and refresh failed
- `maxSessionDuration` hasn't been exceeded
- Network allows communication with the IdP for token refresh

## Testing Authentication Locally

Use the included OIDC test server:

```bash
pnpm dev:with-auth
```

This starts:

- Temporal UI on http://localhost:3000
- UI Server with auth on http://localhost:8081
- Mock OIDC server on http://localhost:8889

Test credentials: Any email address (e.g., `test@example.com`) with any password

See `server/config/with-auth.yaml` for the test configuration.
