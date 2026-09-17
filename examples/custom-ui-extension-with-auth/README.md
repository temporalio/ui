# Custom UI extension with authentication

This example extends `examples/custom-ui-extension` with the piece that example
deliberately leaves out: an extension that establishes **its own** end-user
session.

Temporal UI never shares its access tokens, ID tokens, or cookies with an
extension, and host-provided context is display data rather than a credential.
An extension that needs to know who the user is must authenticate them itself.
This example does that against the repository's sample OIDC server using the
OAuth 2.0 Device Authorization Grant (RFC 8628).

## Why the device flow

Extensions render inside a sandboxed iframe. Temporal UI only grants
`allow-same-origin` to an extension served over HTTPS, so a loopback HTTP
extension such as this one always runs with an **opaque origin**. That means:

- no cookies, `localStorage`, or `sessionStorage`;
- no redirect-based login, because the identity provider cannot set the session
  and interaction cookies it needs;
- no popup escape either — `allow-popups-to-escape-sandbox` is intentionally
  unsupported, so a popup inherits the same opaque origin.

The device flow needs none of them. The extension backend asks the provider for
a short user code, the iframe displays it, and the user approves in an ordinary
browser tab while the iframe polls. The only thing that crosses the iframe
boundary is a user code and, once approved, an opaque session handle.

```
iframe (origin: null)              extension backend (127.0.0.1:8091)   OIDC (localhost:8889)
  │ POST /api/session/start ──────► │ POST /device/auth ───────────────► │
  │ ◄── userCode, verificationUri   │ ◄── device_code (kept server-side) │
  │                                                                      │
  │   user opens the verification URL in a normal tab and signs in       │
  │                                                                      │
  │ POST /api/session/poll ───────► │ POST /token (device_code) ────────► │
  │ ◄── sessionId, claims           │ ──► GET /me for the claims          │
  │ GET /api/session ─────────────► │ refreshes with refresh_token        │
  │ POST /api/session/logout ─────► │ POST /token/revocation ───────────► │
```

Tokens never reach the browser. The backend is a confidential client and holds
the access token, refresh token, and ID token; the iframe only ever sees the
claims the backend chooses to expose.

## Run it locally

Three terminals from the repository root:

```sh
# Terminal 1: sample identity provider (http://localhost:8889)
pnpm oidc-server
```

This example added the `custom-ui-extension` client to
`utilities/oidc-server/support/configuration.ts`. If the sample provider was
already running, restart it — clients are registered at startup, and sign-in
fails with `... device-code is not allowed for this client` until it picks the
new one up.

```sh
# Terminal 2: extension origin (http://127.0.0.1:8091)
pnpm dev:extension-auth-example
```

```sh
# Terminal 3: Temporal UI (http://localhost:3000)
pnpm dev:ui:extension-auth-example
```

Open `http://localhost:3000` and use `localhost` exactly — the example server's
`frame-ancestors` policy trusts `http://localhost:3000`, so `127.0.0.1:3000`
will not render. The extension appears in the sub-navigation on every
application page.

Click **Sign in**, then open `http://localhost:8889/device` in a new tab, enter
the displayed code, and sign in. The sample provider accepts **any email and any
password** and derives the account from the email. Within a poll interval the
iframe shows the signed-in user.

The iframe cannot open the verification URL for you. It has no popup permission,
and following a link would navigate the extension frame away from Temporal UI, so
the URL is rendered as selectable text on purpose.

Complete the sign-in within about two minutes. The sample provider's
`Interaction` and `Grant` lifetimes are 120 seconds, tuned for the auth-testing
workflow rather than for this example.

### Watching a token refresh

The sample provider issues 60 second access tokens. The **Access token** readout
counts down, and when it lapses the extension asks its backend for the session
again, which transparently redeems the refresh token. The status message reports
how many refreshes have happened.

## Configuration

The extension is registered in `server/config/development.yaml` behind
`TEMPORAL_UI_EXTENSION_AUTH_EXAMPLE_ENABLED`, which
`pnpm dev:ui:extension-auth-example` sets. Normal development leaves custom UI
disabled.

```yaml
- id: local-extension-auth-example
  title: Local extension auth example
  slot: app.top-nav.sub-nav
  src: http://127.0.0.1:8091/
  allowedOrigin: http://127.0.0.1:8091
  sizing:
    defaultHeight: 120
    minHeight: 72
    maxHeight: 240
  permissions: []
```

The definition has no permissions, which is the point: the extension learns who
the user is from its own identity provider, not from Temporal UI.

The backend reads these environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8091` | Extension origin port. |
| `OIDC_ISSUER` | `http://localhost:8889` | Identity provider issuer. |
| `OIDC_CLIENT_ID` | `custom-ui-extension` | Client registered in `utilities/oidc-server/support/configuration.ts`. |
| `OIDC_CLIENT_SECRET` | `custom-ui-extension-secret` | Client secret, sent only from the backend. |
| `TEMPORAL_UI_ORIGIN` | `http://localhost:3000` | Written into the `frame-ancestors` policy. |

The client is registered with only the device code and refresh token grants and
no redirect URI, because it never performs a browser redirect.

## Demo-only shortcuts

This example is a local demonstration, not a production template:

- **`Access-Control-Allow-Origin: null`.** The opaque iframe sends
  `Origin: null`, so the backend must echo `null` for the extension to call it.
  `null` is not a unique origin — any sandboxed document can send requests to
  this server. It is acceptable on loopback and unacceptable in production. A
  real deployment serves the extension over HTTPS, receives a genuine origin, and
  allowlists that exact origin. Credentials are never used, and the session
  handle travels as a bearer value rather than a cookie.
- **In-memory state.** Sessions and pending authorizations live in a `Map`.
  Restarting the server signs everyone out.
- **A published client secret.** It matches the existing
  `temporal-ui` / `temporal-secret` demo pair in a file already marked local-only.
- **No password check.** The sample provider creates an account for any email.
- **No persistence in the iframe.** The session handle lives in a JavaScript
  variable because the opaque origin has no storage. Reloading signs the user out.

## Adapting it for production

1. Serve these files from a dedicated HTTPS origin that is not the Temporal UI
   origin, and set `allowedOrigin` and `sandbox.allowSameOrigin: true`.
2. Point `temporal-ui-origin` in `index.html` and the `frame-ancestors` policy at
   the exact production Temporal UI origin, and replace the `null` CORS
   allowance with that extension origin.
3. Once the extension has a real origin it can use storage and cookies, so
   prefer an `HttpOnly`, `Secure`, `SameSite=None` session cookie and the
   authorization code flow with PKCE. Keep the device flow only if the extension
   must work from an opaque origin.
4. Register a client with the grants you actually use, and scope the tokens to
   the extension's own audience. Never send Temporal UI's tokens to an extension
   backend, and never treat host-provided workflow or namespace context as proof
   of access — authorize every backend request against the extension's own
   session.
