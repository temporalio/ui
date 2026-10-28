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

| Field                | Type     | Description                                                                                                                       |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`            | boolean  | Enable or disable authentication                                                                                                  |
| `redirectToProvider` | boolean  | Skip the Temporal UI login page and redirect unauthenticated users directly to the configured OIDC provider                       |
| `maxSessionDuration` | duration | Maximum session duration before forced re-login (e.g., `8h`, `24h`, `168h`). Omit, or set to `0s`, for unlimited session duration |
| `pkceEnabled`        | boolean  | Enable PKCE (Proof Key for Code Exchange) for the OAuth2 authorization code flow. Default: `false`                                |
| `providers`          | array    | List of auth providers (currently only the first is used)                                                                         |

#### Provider Settings

| Field                  | Type     | Description                                                                                                                                                           |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                | string   | Display name for the provider                                                                                                                                         |
| `type`                 | string   | Provider type. Only `oidc` is supported                                                                                                                               |
| `providerUrl`          | string   | OIDC discovery URL (e.g., `https://accounts.google.com/`)                                                                                                             |
| `issuerUrl`            | string   | Optional. Set only if issuer differs from provider URL                                                                                                                |
| `clientId`             | string   | OAuth2 client ID                                                                                                                                                      |
| `clientSecret`         | string   | OAuth2 client secret                                                                                                                                                  |
| `scopes`               | array    | OAuth2 scopes. Include `offline_access` to enable token refresh                                                                                                       |
| `callbackUrl`          | string   | OAuth2 callback URL for your deployment                                                                                                                               |
| `options`              | object   | Additional URL parameters for the auth redirect                                                                                                                       |
| `useIdTokenAsBearer`   | boolean  | Use ID token instead of access token in Authorization header                                                                                                          |
| `refreshTokenDuration` | duration | Lifetime of the refresh token this provider issues. Only needed for providers that issue opaque refresh tokens. See [Refresh token lifetime](#refresh-token-lifetime) |

#### Docker Environment Variables

The bundled `docker.yaml` maps each auth setting to an environment variable, so a
Docker deployment can be configured without supplying a custom config file.

| Environment Variable                   | Config Field                                 | Default           |
| -------------------------------------- | -------------------------------------------- | ----------------- |
| `TEMPORAL_AUTH_ENABLED`                | `auth.enabled`                               | `false`           |
| `TEMPORAL_AUTH_REDIRECT_TO_PROVIDER`   | `auth.redirectToProvider`                    | `false`           |
| `TEMPORAL_MAX_SESSION_DURATION`        | `auth.maxSessionDuration`                    | unset (unlimited) |
| `TEMPORAL_AUTH_LABEL`                  | `auth.providers[0].label`                    | `sso`             |
| `TEMPORAL_AUTH_TYPE`                   | `auth.providers[0].type`                     | `oidc`            |
| `TEMPORAL_AUTH_PROVIDER_URL`           | `auth.providers[0].providerUrl`              | unset             |
| `TEMPORAL_AUTH_ISSUER_URL`             | `auth.providers[0].issuerUrl`                | unset             |
| `TEMPORAL_AUTH_CLIENT_ID`              | `auth.providers[0].clientId`                 | unset             |
| `TEMPORAL_AUTH_CLIENT_SECRET`          | `auth.providers[0].clientSecret`             | unset             |
| `TEMPORAL_AUTH_CALLBACK_URL`           | `auth.providers[0].callbackUrl`              | unset             |
| `TEMPORAL_AUTH_SCOPES`                 | `auth.providers[0].scopes` (comma separated) | unset             |
| `TEMPORAL_AUTH_USE_ID_TOKEN_AS_BEARER` | `auth.providers[0].useIdTokenAsBearer`       | `false`           |
| `TEMPORAL_AUTH_REFRESH_TOKEN_DURATION` | `auth.providers[0].refreshTokenDuration`     | unset             |

## PKCE Support

Temporal UI supports PKCE (Proof Key for Code Exchange, RFC 7636) for the OAuth2 authorization code flow. PKCE provides protection against authorization code interception attacks and is recommended for all OAuth2 applications, especially those that cannot securely store a client secret (e.g., public clients).

### Configuration

```yaml
auth:
  enabled: true
  pkceEnabled: true # Enable PKCE
  providers:
    # ... provider config
```

PKCE can also be enabled via environment variable:

| Environment Variable         | Default | Description                  |
| ---------------------------- | ------- | ---------------------------- |
| `TEMPORAL_AUTH_PKCE_ENABLED` | `false` | Set to `true` to enable PKCE |

### How It Works

When PKCE is enabled:

1. The UI server generates a cryptographically random `code_verifier` (64 bytes, encoded as 86 base64url characters — comfortably within the RFC 7636 range of 43–128) and stores it in a secure, HttpOnly, `SameSite=Lax` cookie scoped to `/` with a 5-minute TTL
2. A `code_challenge` (SHA-256 hash of the verifier) is included in the authorization request as `code_challenge_method=S256`. Only S256 is supported; identity providers that only support the deprecated `plain` method are incompatible
3. Upon receiving the authorization code in the callback, the server validates the verifier against RFC 7636 length and alphabet constraints, then sends it to the token endpoint
4. The identity provider verifies that the challenge matches the verifier, ensuring the party exchanging the code is the same one that initiated the request
5. The verifier cookie is cleared as soon as the callback handler is entered (via `defer`), preventing replay across retries. The `state`, `nonce`, and `code_verifier` cookies all share the same 5-minute TTL

### When to Enable

Enabling PKCE is recommended:

- When using public clients or single-page applications
- To mitigate authorization code interception attacks
- As a defense-in-depth measure even for confidential clients with a client secret
- When required by your identity provider (many modern IdPs strongly recommend or require PKCE)

### Identity Provider Requirements

- Must support PKCE with `S256` challenge method. Major IdPs (Okta, Auth0, Azure AD, Google, Keycloak, Authentik, AWS Cognito, GitHub) all support S256
- Must accept authorization requests of at least 86 base64url characters in `code_challenge`. All compliant IdPs do
- Cookie-based: ensure your IdP redirects back to the UI using a top-level navigation so the `SameSite=Lax` cookies are sent. Embedded iframes will not receive the cookies

### Rolling Out PKCE on an Existing Deployment

Enabling PKCE is a one-way upgrade that should be transparent to end users. However, note that:

- A user who is mid-authentication (started SSO before PKCE was enabled) when the upgrade happens will not have a verifier cookie and will receive a `400 Code verifier is not set` error. They simply need to start SSO again
- There is no migration window required: each user authentication is independent and self-contained

### Troubleshooting

| Symptom                                                           | Likely cause                                                                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `400 Code verifier is not set in request` after enabling PKCE     | Browser dropped the `code_verifier` cookie. Check `SameSite` settings on your reverse proxy / CDN, and that the callback URL uses the same site as the SSO URL                       |
| `400 Code verifier length is outside the RFC 7636 range (43-128)` | A reverse proxy is rewriting the cookie. Verify no middleware is truncating or encoding cookie values                                                                                |
| `400 Code verifier is not valid base64url`                        | Cookie was corrupted in transit. Check that no component is URL-encoding the cookie value a second time                                                                              |
| IdP returns `invalid_grant` on the token endpoint                 | The verifier does not match the challenge from the authorization request. Verify the callback reaches the same server instance that issued the redirect (no session affinity issues) |
| `redirect_uri_mismatch` when PKCE is enabled                      | Some IdPs (notably Azure AD in certain configurations) validate the redirect URI more strictly when PKCE is in use. Verify the `callbackUrl` exactly matches the configured value    |

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
- `0s` or omitted - No maximum (session lasts until refresh token expires)

> Write an explicit zero as `0s`, not `0`. A bare `0` is parsed as a number rather
> than a duration and the server rejects the config file.

### How It Works

1. When a user logs in, the server records the session start time
2. On each request, the server checks if the session has exceeded `maxSessionDuration`
3. If exceeded, the server returns 401 and the user must re-authenticate at the identity provider

This is useful for compliance requirements where users must periodically re-verify their identity, independent of token validity.

The `user*` cookies that carry the access token to the browser are also held to the
session boundary: they are issued for one minute, or for whatever is left of the
session if that is shorter. Without this, a refresh performed shortly before the
boundary would hand the browser a full minute of cookie, leaving the UI looking
signed in while every API call behind it returned 401.

## Refresh Token Lifetime

The `refresh` cookie must outlive the access token, since its whole purpose is to
obtain the next one. Its lifetime is taken from the first of these that is available:

1. The `exp` claim of the refresh token itself, when the provider issues a JWT
   refresh token. Keycloak and similar providers are handled automatically, with no
   configuration.
2. The `refreshTokenDuration` configured for the provider. This is the setting for
   providers that issue **opaque** refresh tokens, whose lifetime the server has no
   way to read.
3. A default of 7 days.

Whichever applies, the cookie is capped at 30 days.

```yaml
auth:
  providers:
    - label: My IdP
      # ...
      refreshTokenDuration: 24h # match your IdP's refresh token lifetime
```

Note that this is not derived from the token response's `expires_in`. That field
describes the **access** token, per [RFC 6749 section 5.1](https://datatracker.ietf.org/doc/html/rfc6749#section-5.1)
and [OIDC Core section 3.2.2.5](https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.2.2.5),
and using it would expire the refresh cookie at the same moment as the token it
exists to replace.

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

If refresh starts failing with 401 at the moment the access token expires, check
the `refresh` cookie in browser devtools. A Max-Age matching the access token
lifetime means the cookie is being dropped before it can be used. Providers that
issue JWT refresh tokens are handled automatically; for one that issues opaque
refresh tokens, set `refreshTokenDuration` on the provider to its refresh token
lifetime. See [Refresh token lifetime](#refresh-token-lifetime).

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
